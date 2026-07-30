import { describe, it, expect } from 'vitest';
import { CIRCUIT_MAPS, getCircuitSvgMap } from './circuitPaths';

describe('Circuit Vector Maps Integrity Audit', () => {
  it('contains valid SVG paths and turn pins for all configured circuits', () => {
    const circuitKeys = Object.keys(CIRCUIT_MAPS);
    expect(circuitKeys.length).toBeGreaterThanOrEqual(4);

    circuitKeys.forEach((key) => {
      const circuit = CIRCUIT_MAPS[key];
      expect(circuit.circuitId).toBeDefined();
      expect(circuit.circuitName).toBeDefined();
      expect(circuit.viewBox).toMatch(/^\d+\s+\d+\s+\d+\s+\d+$/);
      expect(circuit.path).toMatch(/^M\s+\d+/);
      expect(circuit.drs1Path).toBeDefined();
      expect(Array.isArray(circuit.turns)).toBe(true);
      expect(circuit.turns.length).toBeGreaterThan(0);

      // Verify turn pin coordinates are within viewBox boundaries
      const [, , maxW, maxH] = circuit.viewBox.split(' ').map(Number);
      circuit.turns.forEach((turn) => {
        expect(turn.x).toBeGreaterThanOrEqual(0);
        expect(turn.x).toBeLessThanOrEqual(maxW);
        expect(turn.y).toBeGreaterThanOrEqual(0);
        expect(turn.y).toBeLessThanOrEqual(maxH);
      });
    });
  });

  it('correctly resolves fallback map for unknown circuit IDs', () => {
    const fallbackMap = getCircuitSvgMap('unknown_circuit_id');
    expect(fallbackMap).toBeDefined();
    expect(fallbackMap.circuitId).toBe('zandvoort');
  });
});
