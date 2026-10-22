import { useState } from 'react';
import { InputNumber, Button, Spin } from 'antd';

// One stock number per colour + size combination, laid out as a grid
// (colours down the side, sizes across the top), which is how shop staff
// think about stock. Keys are lower-cased "colour|size" so they match the
// server's name-based lookup.
export const stockKey = (color, size) =>
  `${String(color || '').trim().toLowerCase()}|${String(size || '').trim().toLowerCase()}`;

// Every combination the shop will offer for the chosen colours/sizes.
export const stockCombinations = (colors = [], sizes = []) => {
  const rows = colors.length ? colors : [null];
  const cols = sizes.length ? sizes : [null];
  if (!colors.length && !sizes.length) return [];
  return rows.flatMap((color) => cols.map((size) => ({ color, size })));
};

export const VariantStockGrid = ({ colors = [], sizes = [], value = {}, onChange, readOnly = false, loading = false }) => {
  const [fillValue, setFillValue] = useState(null);
  const combos = stockCombinations(colors, sizes);

  if (loading) return <div className="py-4 text-center"><Spin size="small" /></div>;
  if (!combos.length) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        Choose the colours and sizes above, then enter how many of each you have.
      </div>
    );
  }

  const rows = colors.length ? colors : [null];
  const cols = sizes.length ? sizes : [null];
  const get = (c, s) => Number(value[stockKey(c, s)] ?? 0);
  const total = combos.reduce((sum, { color, size }) => sum + get(color, size), 0);
  const soldOut = combos.filter(({ color, size }) => get(color, size) <= 0).length;

  const set = (c, s, n) => onChange?.({ ...value, [stockKey(c, s)]: n == null ? 0 : n });
  const fillAll = () => {
    if (fillValue == null) return;
    const next = { ...value };
    combos.forEach(({ color, size }) => { next[stockKey(color, size)] = fillValue; });
    onChange?.(next);
  };

  const cellStyle = { padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' };

  return (
    <div>
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-sm text-muted-foreground">Set all to</span>
          <InputNumber min={0} precision={0} value={fillValue} onChange={setFillValue} placeholder="e.g. 10" style={{ width: 110 }} />
          <Button size="small" onClick={fillAll} disabled={fillValue == null}>Apply</Button>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ ...cellStyle, textAlign: 'left' }} className="text-muted-foreground text-xs font-medium">
                {colors.length ? 'Colour' : ''}{colors.length && sizes.length ? ' / Size' : (!colors.length ? 'Size' : '')}
              </th>
              {cols.map((size) => (
                <th key={size ?? 'all'} style={{ ...cellStyle, textAlign: 'center' }} className="text-xs font-medium text-foreground">
                  {size ?? 'Stock'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((color) => (
              <tr key={color ?? 'all'}>
                <td style={cellStyle} className="text-sm text-foreground">{color ?? 'Stock'}</td>
                {cols.map((size) => {
                  const n = get(color, size);
                  return (
                    <td key={size ?? 'all'} style={{ ...cellStyle, textAlign: 'center' }}>
                      {readOnly ? (
                        <span className={n <= 0 ? 'text-red-400 font-medium' : 'text-foreground'}>
                          {n <= 0 ? 'Sold out' : n}
                        </span>
                      ) : (
                        <InputNumber
                          min={0}
                          precision={0}
                          value={n}
                          onChange={(v) => set(color, size, v)}
                          status={n <= 0 ? 'warning' : undefined}
                          style={{ width: 80 }}
                          aria-label={`Stock for ${[color, size].filter(Boolean).join(' ')}`}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 mt-3 text-sm">
        <span className="text-foreground">Total in stock: <strong>{total}</strong></span>
        {soldOut > 0 && (
          <span className="text-red-400">
            {soldOut} of {combos.length} {combos.length === 1 ? 'option' : 'options'} sold out
          </span>
        )}
      </div>
    </div>
  );
};
