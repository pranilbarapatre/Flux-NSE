import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { CandleData } from '../data/stockData';

export type ChartType = 'candles' | 'hollow' | 'heikinashi' | 'line' | 'area' | 'bars';

interface Props {
  data: CandleData[];
  width: number;
  height: number;
  chartType: ChartType;
  smaData?: (number | null)[];
  emaData?: (number | null)[];
  bbData?: { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] };
  vwapData?: (number | null)[];
  onCrosshairMove?: (candle: CandleData | null, index: number) => void;
  drawingTool?: string;
  magnetMode?: boolean;
  showDrawings?: boolean;
  onClearDrawings?: () => void;
  alerts?: { price: number; type: string }[];
  zoomLevel?: number;
}

interface Drawing {
  type: string;
  points: { x: number; y: number; price?: number; time?: string }[];
  color: string;
  text?: string;
}

export default function CandlestickChart({
  data, width, height, chartType, smaData, emaData, bbData, vwapData,
  onCrosshairMove, drawingTool, magnetMode, showDrawings = true, alerts, zoomLevel = 1,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [crosshair, setCrosshair] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [textInput, setTextInput] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [textValue, setTextValue] = useState('');
  const [measureInfo, setMeasureInfo] = useState<{ start: CandleData | null; end: CandleData | null; visible: boolean }>({ start: null, end: null, visible: false });
  const [freeDrawPoints, setFreeDrawPoints] = useState<{ x: number; y: number }[]>([]);
  const [isFreeDraw, setIsFreeDraw] = useState(false);

  const chartPadding = { top: 10, right: 65, bottom: 30, left: 0 };
  const volumeHeight = height * 0.18;
  const priceChartHeight = height - volumeHeight - chartPadding.top - chartPadding.bottom;
  const chartWidth = width - chartPadding.left - chartPadding.right;

  const baseCandleWidth = Math.max(3, Math.min(14, chartWidth / Math.min(data.length, 80)));
  const candleWidth = Math.max(2, baseCandleWidth * zoomLevel);
  const gap = Math.max(1, candleWidth * 0.3);
  const totalCandleWidth = candleWidth + gap;

  const maxVisibleCandles = Math.floor(chartWidth / totalCandleWidth);
  const visibleStart = Math.max(0, Math.min(data.length - maxVisibleCandles, data.length - maxVisibleCandles - scrollOffset));
  const visibleEnd = Math.min(data.length, visibleStart + maxVisibleCandles);
  const visibleData = data.slice(visibleStart, visibleEnd);

  // Heikin-Ashi transformation
  const transformedData = useMemo(() => {
    if (chartType !== 'heikinashi') return visibleData;
    const ha: CandleData[] = [];
    const fullHA: CandleData[] = [];
    // Calculate HA for all data first
    for (let i = 0; i < data.length; i++) {
      const c = data[i];
      const haClose = (c.open + c.high + c.low + c.close) / 4;
      const haOpen = i === 0 ? (c.open + c.close) / 2 : (fullHA[i - 1].open + fullHA[i - 1].close) / 2;
      const haHigh = Math.max(c.high, haOpen, haClose);
      const haLow = Math.min(c.low, haOpen, haClose);
      fullHA.push({
        time: c.time,
        open: Math.round(haOpen * 100) / 100,
        high: Math.round(haHigh * 100) / 100,
        low: Math.round(haLow * 100) / 100,
        close: Math.round(haClose * 100) / 100,
        volume: c.volume,
        isBullish: haClose >= haOpen,
      });
    }
    for (let i = visibleStart; i < visibleEnd; i++) {
      ha.push(fullHA[i]);
    }
    return ha;
  }, [data, visibleData, visibleStart, visibleEnd, chartType]);

  const { minPrice, maxPrice, maxVol } = useMemo(() => {
    if (transformedData.length === 0) return { minPrice: 0, maxPrice: 0, minVol: 0, maxVol: 0 };
    let minP = Infinity, maxP = -Infinity, minV = Infinity, maxV = -Infinity;
    transformedData.forEach(c => {
      if (c.low < minP) minP = c.low;
      if (c.high > maxP) maxP = c.high;
      if (c.volume < minV) minV = c.volume;
      if (c.volume > maxV) maxV = c.volume;
    });
    const priceRange = maxP - minP || 1;
    minP -= priceRange * 0.05;
    maxP += priceRange * 0.05;
    return { minPrice: minP, maxPrice: maxP, minVol: minV, maxVol: maxV };
  }, [transformedData]);

  const priceToY = useCallback((price: number) => {
    const range = maxPrice - minPrice || 1;
    return chartPadding.top + priceChartHeight * (1 - (price - minPrice) / range);
  }, [minPrice, maxPrice, priceChartHeight, chartPadding.top]);

  const yToPrice = useCallback((y: number) => {
    const range = maxPrice - minPrice || 1;
    return minPrice + range * (1 - (y - chartPadding.top) / priceChartHeight);
  }, [minPrice, maxPrice, priceChartHeight, chartPadding.top]);

  const volToY = useCallback((vol: number) => {
    const volBase = height - chartPadding.bottom;
    return volBase - (volumeHeight * 0.9) * (vol / (maxVol || 1));
  }, [maxVol, height, chartPadding.bottom, volumeHeight]);

  const xForIndex = useCallback((i: number) => {
    return chartPadding.left + i * totalCandleWidth + totalCandleWidth / 2;
  }, [chartPadding.left, totalCandleWidth]);

  // Snap to candle if magnet mode
  const snapToCandle = useCallback((x: number, y: number) => {
    if (!magnetMode) return { x, y };
    const candleIndex = Math.round((x - chartPadding.left - totalCandleWidth / 2) / totalCandleWidth);
    if (candleIndex >= 0 && candleIndex < transformedData.length) {
      const c = transformedData[candleIndex];
      const snappedX = xForIndex(candleIndex);
      // Snap to nearest OHLC
      const prices = [c.open, c.high, c.low, c.close];
      const ys = prices.map(p => priceToY(p));
      let bestY = y, bestDist = Infinity;
      ys.forEach(py => {
        const dist = Math.abs(py - y);
        if (dist < bestDist) { bestDist = dist; bestY = py; }
      });
      return { x: snappedX, y: bestY };
    }
    return { x, y };
  }, [magnetMode, chartPadding.left, totalCandleWidth, transformedData, xForIndex, priceToY]);

  // Price grid lines
  const priceGridLines = useMemo(() => {
    const lines: { price: number; y: number }[] = [];
    const range = maxPrice - minPrice;
    if (range === 0) return lines;
    const step = Math.pow(10, Math.floor(Math.log10(range))) / 2;
    const start = Math.ceil(minPrice / step) * step;
    for (let p = start; p <= maxPrice; p += step) {
      lines.push({ price: Math.round(p * 100) / 100, y: priceToY(p) });
    }
    return lines;
  }, [minPrice, maxPrice, priceToY]);

  // Mouse handlers
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCrosshair({ x, y, visible: true });

    const candleIndex = Math.floor((x - chartPadding.left) / totalCandleWidth);
    if (candleIndex >= 0 && candleIndex < transformedData.length && onCrosshairMove) {
      onCrosshairMove(transformedData[candleIndex], visibleStart + candleIndex);
    }

    if (isDragging && (drawingTool === 'cursor' || !drawingTool)) {
      const dx = x - dragStart;
      setScrollOffset(prev => prev + Math.round(dx / totalCandleWidth));
      setDragStart(x);
    }

    // Free draw
    if (isFreeDraw && drawingTool === 'pen') {
      setFreeDrawPoints(prev => [...prev, { x, y }]);
    }

    if (currentDrawing && drawingTool && !['cursor', 'crosshair', 'pen', 'text', 'ruler', 'magnet', 'eye', 'trash'].includes(drawingTool)) {
      const snapped = snapToCandle(x, y);
      const updated = { ...currentDrawing, points: [...currentDrawing.points] };
      if (updated.points.length >= 2) {
        updated.points[updated.points.length - 1] = { ...snapped, price: yToPrice(snapped.y) };
      }
      setCurrentDrawing(updated);
    }

    // Ruler/measure mode
    if (currentDrawing && drawingTool === 'ruler') {
      const updated = { ...currentDrawing, points: [...currentDrawing.points] };
      updated.points[1] = { x, y, price: yToPrice(y) };
      setCurrentDrawing(updated);
      // Get candle info
      const startIdx = Math.floor((currentDrawing.points[0].x - chartPadding.left) / totalCandleWidth);
      const endIdx = Math.floor((x - chartPadding.left) / totalCandleWidth);
      if (startIdx >= 0 && startIdx < transformedData.length && endIdx >= 0 && endIdx < transformedData.length) {
        setMeasureInfo({
          start: transformedData[startIdx],
          end: transformedData[endIdx],
          visible: true
        });
      }
    }
  }, [chartPadding.left, totalCandleWidth, transformedData, visibleStart, onCrosshairMove, isDragging, dragStart, currentDrawing, drawingTool, snapToCandle, yToPrice, isFreeDraw]);

  const handleMouseLeave = useCallback(() => {
    setCrosshair(prev => ({ ...prev, visible: false }));
    if (onCrosshairMove) onCrosshairMove(null, -1);
    setIsDragging(false);
    if (isFreeDraw) {
      // Finish free draw
      if (freeDrawPoints.length > 2) {
        setDrawings(prev => [...prev, { type: 'pen', points: freeDrawPoints.map(p => ({ ...p, price: yToPrice(p.y) })), color: '#3b82f6' }]);
      }
      setFreeDrawPoints([]);
      setIsFreeDraw(false);
    }
  }, [onCrosshairMove, isFreeDraw, freeDrawPoints, yToPrice]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const snapped = snapToCandle(x, y);

    if (!drawingTool || drawingTool === 'cursor') {
      setIsDragging(true);
      setDragStart(x);
      return;
    }

    if (drawingTool === 'crosshair') return;

    if (drawingTool === 'trash') {
      setDrawings([]);
      setMeasureInfo({ start: null, end: null, visible: false });
      return;
    }

    if (drawingTool === 'magnet' || drawingTool === 'eye') return;

    if (drawingTool === 'pen') {
      setIsFreeDraw(true);
      setFreeDrawPoints([{ x, y }]);
      return;
    }

    if (drawingTool === 'text') {
      setTextInput({ x, y, active: true });
      setTextValue('');
      return;
    }

    if (drawingTool === 'hline') {
      const price = yToPrice(y);
      setDrawings(prev => [...prev, {
        type: 'hline',
        points: [{ x: 0, y, price }],
        color: '#f59e0b',
      }]);
      return;
    }

    if (drawingTool === 'ruler') {
      if (!currentDrawing) {
        setCurrentDrawing({
          type: 'ruler',
          points: [{ x, y, price: yToPrice(y) }, { x, y, price: yToPrice(y) }],
          color: '#f59e0b',
        });
      } else {
        setCurrentDrawing(null);
      }
      return;
    }

    // Two-point drawings (trendline, ray, fib, rect)
    if (!currentDrawing) {
      const colors: Record<string, string> = {
        trendline: '#3b82f6', ray: '#22d3ee', fib: '#8b5cf6', rect: '#f59e0b',
      };
      setCurrentDrawing({
        type: drawingTool,
        points: [
          { ...snapped, price: yToPrice(snapped.y) },
          { ...snapped, price: yToPrice(snapped.y) }
        ],
        color: colors[drawingTool] || '#3b82f6',
      });
    } else {
      setDrawings(prev => [...prev, currentDrawing]);
      setCurrentDrawing(null);
    }
  }, [drawingTool, currentDrawing, snapToCandle, yToPrice]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (isFreeDraw && freeDrawPoints.length > 2) {
      setDrawings(prev => [...prev, { type: 'pen', points: freeDrawPoints.map(p => ({ ...p, price: yToPrice(p.y) })), color: '#3b82f6' }]);
      setFreeDrawPoints([]);
      setIsFreeDraw(false);
    }
  }, [isFreeDraw, freeDrawPoints, yToPrice]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -3 : 3;
    setScrollOffset(prev => Math.max(0, Math.min(data.length - 20, prev + delta)));
  }, [data.length]);

  // Handle text submission
  const submitText = useCallback(() => {
    if (textValue.trim() && textInput.active) {
      setDrawings(prev => [...prev, {
        type: 'text',
        points: [{ x: textInput.x, y: textInput.y, price: yToPrice(textInput.y) }],
        color: '#ffffff',
        text: textValue,
      }]);
    }
    setTextInput({ x: 0, y: 0, active: false });
    setTextValue('');
  }, [textValue, textInput, yToPrice]);

  useEffect(() => {
    setScrollOffset(0);
  }, [data.length]);

  // Clear drawings externally
  useEffect(() => {
    if (drawingTool === 'trash') {
      setDrawings([]);
    }
  }, [drawingTool]);

  // Render indicator line
  const renderIndicatorLine = (values: (number | null)[], color: string, dashArray?: string, strokeW = 1.2) => {
    let pathD = '';
    let started = false;
    values.slice(visibleStart, visibleEnd).forEach((val, i) => {
      if (val === null) { started = false; return; }
      const x = xForIndex(i);
      const y = priceToY(val);
      if (!started) { pathD += `M${x},${y}`; started = true; }
      else { pathD += `L${x},${y}`; }
    });
    if (!pathD) return null;
    return <path d={pathD} fill="none" stroke={color} strokeWidth={strokeW} strokeDasharray={dashArray} opacity={0.8} />;
  };

  const crosshairPrice = crosshair.visible ?
    minPrice + (maxPrice - minPrice) * (1 - (crosshair.y - chartPadding.top) / priceChartHeight) : null;

  const lastCandle = transformedData.length > 0 ? transformedData[transformedData.length - 1] : null;

  // Render line/area chart
  const renderLineChart = () => {
    let pathD = '';
    let areaD = '';
    transformedData.forEach((c, i) => {
      const x = xForIndex(i);
      const y = priceToY(c.close);
      if (i === 0) { pathD += `M${x},${y}`; areaD += `M${x},${y}`; }
      else { pathD += `L${x},${y}`; areaD += `L${x},${y}`; }
    });

    if (chartType === 'area') {
      const lastX = xForIndex(transformedData.length - 1);
      const firstX = xForIndex(0);
      const bottom = height - chartPadding.bottom - volumeHeight;
      areaD += `L${lastX},${bottom}L${firstX},${bottom}Z`;
      return (
        <>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#areaGrad)" />
          <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth={2} />
        </>
      );
    }
    return <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth={2} />;
  };

  // Render OHLC bars
  const renderBarChart = () => {
    return transformedData.map((c, i) => {
      const x = xForIndex(i);
      const color = c.isBullish ? '#26a69a' : '#ef5350';
      return (
        <g key={`bar-${i}`}>
          <line x1={x} y1={priceToY(c.high)} x2={x} y2={priceToY(c.low)} stroke={color} strokeWidth={1} />
          <line x1={x - candleWidth / 3} y1={priceToY(c.open)} x2={x} y2={priceToY(c.open)} stroke={color} strokeWidth={1.5} />
          <line x1={x} y1={priceToY(c.close)} x2={x + candleWidth / 3} y2={priceToY(c.close)} stroke={color} strokeWidth={1.5} />
        </g>
      );
    });
  };

  // Render candlesticks (normal, hollow, heikin-ashi)
  const renderCandles = () => {
    return transformedData.map((c, i) => {
      const x = xForIndex(i);
      const bodyTop = priceToY(Math.max(c.open, c.close));
      const bodyBottom = priceToY(Math.min(c.open, c.close));
      const bodyHeight = Math.max(1, bodyBottom - bodyTop);
      const wickTop = priceToY(c.high);
      const wickBottom = priceToY(c.low);
      const bullColor = chartType === 'heikinashi' ? '#26a69a' : '#26a69a';
      const bearColor = chartType === 'heikinashi' ? '#ef5350' : '#ef5350';
      const color = c.isBullish ? bullColor : bearColor;
      const isHollow = chartType === 'hollow' ? c.isBullish : false;

      return (
        <g key={`c-${i}`}>
          <line x1={x} y1={wickTop} x2={x} y2={wickBottom} stroke={color} strokeWidth={1} />
          <rect
            x={x - candleWidth / 2}
            y={bodyTop}
            width={candleWidth}
            height={bodyHeight}
            fill={isHollow ? 'transparent' : (chartType === 'candles' && c.isBullish ? '#26a69a' : color)}
            stroke={color}
            strokeWidth={chartType === 'hollow' ? 1.5 : 1}
            rx={0.5}
          />
        </g>
      );
    });
  };

  // Render drawings
  const renderDrawings = () => {
    if (!showDrawings) return null;
    const allDrawings = [...drawings, ...(currentDrawing ? [currentDrawing] : [])];
    return allDrawings.map((d, i) => {
      if (d.type === 'trendline' && d.points.length >= 2) {
        return (
          <g key={`d-${i}`}>
            <line x1={d.points[0].x} y1={d.points[0].y} x2={d.points[1].x} y2={d.points[1].y} stroke={d.color} strokeWidth={1.5} />
            <circle cx={d.points[0].x} cy={d.points[0].y} r={3} fill={d.color} opacity={0.5} />
            <circle cx={d.points[1].x} cy={d.points[1].y} r={3} fill={d.color} opacity={0.5} />
          </g>
        );
      }
      if (d.type === 'hline' && d.points.length >= 1) {
        return (
          <g key={`d-${i}`}>
            <line x1={0} y1={d.points[0].y} x2={width - chartPadding.right} y2={d.points[0].y} stroke={d.color} strokeWidth={1} strokeDasharray="6,3" />
            <rect x={width - chartPadding.right} y={d.points[0].y - 9} width={58} height={18} fill={d.color} rx={2} opacity={0.8} />
            <text x={width - chartPadding.right + 29} y={d.points[0].y + 3} fill="white" fontSize={9} fontFamily="monospace" textAnchor="middle">
              {d.points[0].price?.toFixed(2)}
            </text>
          </g>
        );
      }
      if (d.type === 'ray' && d.points.length >= 2) {
        const dx = d.points[1].x - d.points[0].x;
        const dy = d.points[1].y - d.points[0].y;
        const extX = d.points[0].x + dx * 20;
        const extY = d.points[0].y + dy * 20;
        return (
          <g key={`d-${i}`}>
            <line x1={d.points[0].x} y1={d.points[0].y} x2={extX} y2={extY} stroke={d.color} strokeWidth={1} />
            <circle cx={d.points[0].x} cy={d.points[0].y} r={3} fill={d.color} opacity={0.5} />
          </g>
        );
      }
      if (d.type === 'fib' && d.points.length >= 2) {
        const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
        const range = d.points[1].y - d.points[0].y;
        const priceRange = (d.points[0].price || 0) - (d.points[1].price || 0);
        const colors = ['#ef4444', '#f59e0b', '#eab308', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'];
        const minX = Math.min(d.points[0].x, d.points[1].x);
        const maxX = Math.max(d.points[0].x, d.points[1].x);
        return (
          <g key={`d-${i}`}>
            {levels.map((l, j) => {
              const y = d.points[0].y + range * l;
              const price = (d.points[0].price || 0) - priceRange * l;
              return (
                <g key={j}>
                  <line x1={minX} y1={y} x2={maxX} y2={y} stroke={colors[j]} strokeWidth={0.8} opacity={0.7} />
                  {j < levels.length - 1 && (
                    <rect x={minX} y={y} width={maxX - minX} height={(range * (levels[j + 1] - l))} fill={colors[j]} opacity={0.04} />
                  )}
                  <text x={maxX + 5} y={y + 3} fill={colors[j]} fontSize={9} fontFamily="monospace">
                    {(l * 100).toFixed(1)}% ({price.toFixed(2)})
                  </text>
                </g>
              );
            })}
          </g>
        );
      }
      if (d.type === 'rect' && d.points.length >= 2) {
        const rx = Math.min(d.points[0].x, d.points[1].x);
        const ry = Math.min(d.points[0].y, d.points[1].y);
        const rw = Math.abs(d.points[1].x - d.points[0].x);
        const rh = Math.abs(d.points[1].y - d.points[0].y);
        return (
          <g key={`d-${i}`}>
            <rect x={rx} y={ry} width={rw} height={rh} fill={d.color} fillOpacity={0.08} stroke={d.color} strokeWidth={1} />
            <circle cx={d.points[0].x} cy={d.points[0].y} r={3} fill={d.color} opacity={0.5} />
            <circle cx={d.points[1].x} cy={d.points[1].y} r={3} fill={d.color} opacity={0.5} />
          </g>
        );
      }
      if (d.type === 'text' && d.text) {
        return (
          <g key={`d-${i}`}>
            <rect x={d.points[0].x - 2} y={d.points[0].y - 12} width={d.text.length * 7 + 8} height={18} fill="#1a1a2e" rx={3} stroke="#374151" strokeWidth={0.5} />
            <text x={d.points[0].x + 2} y={d.points[0].y} fill="white" fontSize={11} fontFamily="sans-serif">{d.text}</text>
          </g>
        );
      }
      if (d.type === 'pen' && d.points.length >= 2) {
        let penD = '';
        d.points.forEach((p, pi) => {
          if (pi === 0) penD += `M${p.x},${p.y}`;
          else penD += `L${p.x},${p.y}`;
        });
        return <path key={`d-${i}`} d={penD} fill="none" stroke={d.color} strokeWidth={1.5} opacity={0.8} />;
      }
      if (d.type === 'ruler' && d.points.length >= 2) {
        const p1 = d.points[0], p2 = d.points[1];
        const priceDiff = (p1.price || 0) - (p2.price || 0);
        const pctDiff = ((priceDiff / (p1.price || 1)) * 100);
        const barsDiff = Math.abs(Math.round((p2.x - p1.x) / totalCandleWidth));
        return (
          <g key={`d-${i}`}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4,3" />
            <line x1={p1.x} y1={p1.y} x2={p1.x} y2={p2.y} stroke="#f59e0b33" strokeWidth={0.5} />
            <line x1={p1.x} y1={p2.y} x2={p2.x} y2={p2.y} stroke="#f59e0b33" strokeWidth={0.5} />
            <circle cx={p1.x} cy={p1.y} r={3} fill="#f59e0b" />
            <circle cx={p2.x} cy={p2.y} r={3} fill="#f59e0b" />
            <rect x={(p1.x + p2.x) / 2 - 55} y={(p1.y + p2.y) / 2 - 22} width={110} height={44} fill="#1a1a2e" rx={4} stroke="#f59e0b" strokeWidth={0.5} />
            <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 6} fill="#f59e0b" fontSize={10} textAnchor="middle" fontFamily="monospace">
              {priceDiff >= 0 ? '+' : ''}{priceDiff.toFixed(2)} ({pctDiff >= 0 ? '+' : ''}{pctDiff.toFixed(2)}%)
            </text>
            <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 + 10} fill="#9ca3af" fontSize={9} textAnchor="middle" fontFamily="monospace">
              {barsDiff} bars
            </text>
          </g>
        );
      }
      return null;
    });
  };

  // Free draw preview
  const renderFreeDrawPreview = () => {
    if (freeDrawPoints.length < 2) return null;
    let d = '';
    freeDrawPoints.forEach((p, i) => {
      if (i === 0) d += `M${p.x},${p.y}`;
      else d += `L${p.x},${p.y}`;
    });
    return <path d={d} fill="none" stroke="#3b82f6" strokeWidth={1.5} opacity={0.6} />;
  };

  // Cursor style
  const getCursor = () => {
    if (drawingTool === 'crosshair') return 'crosshair';
    if (drawingTool === 'cursor' || !drawingTool) return isDragging ? 'grabbing' : 'grab';
    if (drawingTool === 'text') return 'text';
    if (drawingTool === 'pen') return 'default';
    return 'crosshair';
  };

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: getCursor() }}
      >
        <rect width={width} height={height} fill="#0a0a14" />

        {/* Grid lines */}
        {priceGridLines.map((line, i) => (
          <g key={i}>
            <line x1={chartPadding.left} y1={line.y} x2={width - chartPadding.right} y2={line.y} stroke="#1a1a2e" strokeWidth={0.5} />
            <text x={width - chartPadding.right + 5} y={line.y + 3} fill="#4b5563" fontSize={9} fontFamily="monospace">
              {line.price.toFixed(2)}
            </text>
          </g>
        ))}

        {/* Time labels */}
        {transformedData.map((c, i) => {
          if (i % Math.max(1, Math.floor(transformedData.length / 10)) !== 0) return null;
          const x = xForIndex(i);
          return (
            <g key={`t-${i}`}>
              <line x1={x} y1={chartPadding.top} x2={x} y2={height - chartPadding.bottom} stroke="#1a1a2e" strokeWidth={0.5} strokeDasharray="2,4" />
              <text x={x} y={height - chartPadding.bottom + 15} fill="#4b5563" fontSize={8} textAnchor="middle" fontFamily="monospace">
                {c.time}
              </text>
            </g>
          );
        })}

        {/* Volume bars */}
        {transformedData.map((c, i) => {
          const x = xForIndex(i) - candleWidth / 2;
          const vy = volToY(c.volume);
          const vh = height - chartPadding.bottom - vy;
          return (
            <rect key={`v-${i}`} x={x} y={vy} width={candleWidth} height={Math.max(0, vh)}
              fill={c.isBullish ? '#10b981' : '#ef4444'} opacity={0.2} rx={1} />
          );
        })}

        {/* Volume separator */}
        <line x1={0} y1={height - chartPadding.bottom - volumeHeight}
          x2={width - chartPadding.right} y2={height - chartPadding.bottom - volumeHeight}
          stroke="#1f2937" strokeWidth={0.5} />

        {/* Bollinger Bands */}
        {bbData && (
          <>
            {renderIndicatorLine(bbData.upper, '#8b5cf6', '3,3')}
            {renderIndicatorLine(bbData.middle, '#8b5cf6')}
            {renderIndicatorLine(bbData.lower, '#8b5cf6', '3,3')}
            {(() => {
              let fillD = '';
              const upper = bbData.upper.slice(visibleStart, visibleEnd);
              const lower = bbData.lower.slice(visibleStart, visibleEnd);
              let started = false;
              upper.forEach((val, i) => {
                if (val === null || lower[i] === null) return;
                const x = xForIndex(i);
                if (!started) { fillD += `M${x},${priceToY(val)}`; started = true; }
                else { fillD += `L${x},${priceToY(val)}`; }
              });
              const startIdx = lower.findIndex(v => v !== null);
              const endIdx = lower.length - 1 - [...lower].reverse().findIndex(v => v !== null);
              for (let i = endIdx; i >= startIdx; i--) {
                if (lower[i] !== null) { fillD += `L${xForIndex(i)},${priceToY(lower[i]!)}`; }
              }
              fillD += 'Z';
              return <path d={fillD} fill="#8b5cf6" opacity={0.05} />;
            })()}
          </>
        )}

        {/* SMA */}
        {smaData && renderIndicatorLine(smaData, '#f59e0b')}
        {/* EMA */}
        {emaData && renderIndicatorLine(emaData, '#06b6d4')}
        {/* VWAP */}
        {vwapData && renderIndicatorLine(vwapData, '#f97316', undefined, 1.5)}

        {/* Main chart rendering */}
        {(chartType === 'line' || chartType === 'area') ? renderLineChart() :
         chartType === 'bars' ? renderBarChart() :
         renderCandles()}

        {/* Alert price lines */}
        {alerts && alerts.map((alert, i) => {
          const ay = priceToY(alert.price);
          if (ay < chartPadding.top || ay > height - chartPadding.bottom) return null;
          return (
            <g key={`alert-${i}`}>
              <line x1={0} y1={ay} x2={width - chartPadding.right} y2={ay} stroke="#f59e0b" strokeWidth={0.8} strokeDasharray="8,4" opacity={0.6} />
              <rect x={width - chartPadding.right} y={ay - 9} width={58} height={18} fill="#f59e0b" rx={2} opacity={0.8} />
              <text x={width - chartPadding.right + 29} y={ay + 3} fill="white" fontSize={9} fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                {alert.price.toFixed(2)}
              </text>
              <text x={width - chartPadding.right - 5} y={ay + 3} fill="#f59e0b" fontSize={8} textAnchor="end">🔔</text>
            </g>
          );
        })}

        {/* Current price line */}
        {lastCandle && (
          <>
            <line x1={chartPadding.left} y1={priceToY(lastCandle.close)} x2={width - chartPadding.right} y2={priceToY(lastCandle.close)}
              stroke={lastCandle.isBullish ? '#26a69a' : '#ef5350'} strokeWidth={0.8} strokeDasharray="4,3" opacity={0.7} />
            <rect x={width - chartPadding.right} y={priceToY(lastCandle.close) - 9} width={62} height={18}
              fill={lastCandle.isBullish ? '#26a69a' : '#ef5350'} rx={2} />
            <text x={width - chartPadding.right + 31} y={priceToY(lastCandle.close) + 3}
              fill="white" fontSize={9} fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              {lastCandle.close.toFixed(2)}
            </text>
          </>
        )}

        {/* Drawings */}
        {renderDrawings()}
        {renderFreeDrawPreview()}

        {/* Crosshair */}
        {crosshair.visible && drawingTool !== 'cursor' && (
          <>
            <line x1={crosshair.x} y1={chartPadding.top} x2={crosshair.x} y2={height - chartPadding.bottom} stroke="#4b5563" strokeWidth={0.5} strokeDasharray="3,3" />
            <line x1={chartPadding.left} y1={crosshair.y} x2={width - chartPadding.right} y2={crosshair.y} stroke="#4b5563" strokeWidth={0.5} strokeDasharray="3,3" />
            {crosshairPrice !== null && crosshair.y > chartPadding.top && crosshair.y < height - chartPadding.bottom - volumeHeight && (
              <>
                <rect x={width - chartPadding.right} y={crosshair.y - 9} width={62} height={18} fill="#374151" rx={2} />
                <text x={width - chartPadding.right + 31} y={crosshair.y + 3} fill="white" fontSize={9} fontFamily="monospace" textAnchor="middle">
                  {crosshairPrice.toFixed(2)}
                </text>
              </>
            )}
            {(() => {
              const candleIdx = Math.floor((crosshair.x - chartPadding.left) / totalCandleWidth);
              if (candleIdx >= 0 && candleIdx < transformedData.length) {
                return (
                  <>
                    <rect x={crosshair.x - 30} y={height - chartPadding.bottom + 2} width={60} height={18} fill="#374151" rx={2} />
                    <text x={crosshair.x} y={height - chartPadding.bottom + 14} fill="white" fontSize={8} fontFamily="monospace" textAnchor="middle">
                      {transformedData[candleIdx].time}
                    </text>
                  </>
                );
              }
              return null;
            })()}
          </>
        )}

        {/* Magnet indicator */}
        {magnetMode && crosshair.visible && (
          <circle cx={crosshair.x} cy={crosshair.y} r={6} fill="none" stroke="#f59e0b" strokeWidth={1} opacity={0.5}>
            <animate attributeName="r" values="4;8;4" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>

      {/* Text input overlay */}
      {textInput.active && (
        <div className="absolute z-50" style={{ left: textInput.x, top: textInput.y }}>
          <input
            type="text"
            value={textValue}
            onChange={e => setTextValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitText(); if (e.key === 'Escape') setTextInput({ x: 0, y: 0, active: false }); }}
            onBlur={submitText}
            className="bg-[#1a1a2e] border border-blue-500 rounded px-2 py-1 text-white text-xs outline-none min-w-[120px]"
            placeholder="Add note..."
            autoFocus
          />
        </div>
      )}

      {/* Measure info overlay */}
      {measureInfo.visible && measureInfo.start && measureInfo.end && (
        <div className="absolute top-2 right-20 bg-[#1a1a2e] border border-gray-700 rounded-lg p-2 text-[10px] z-40">
          <div className="text-gray-400">
            From: <span className="text-white">{measureInfo.start.time} — ₹{measureInfo.start.close.toFixed(2)}</span>
          </div>
          <div className="text-gray-400">
            To: <span className="text-white">{measureInfo.end.time} — ₹{measureInfo.end.close.toFixed(2)}</span>
          </div>
          <div className="text-yellow-400 font-medium mt-1">
            Δ ₹{(measureInfo.end.close - measureInfo.start.close).toFixed(2)} ({((measureInfo.end.close - measureInfo.start.close) / measureInfo.start.close * 100).toFixed(2)}%)
          </div>
        </div>
      )}
    </div>
  );
}
