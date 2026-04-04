import { getBoardScale } from './boardViewport'

describe('boardViewport', () => {
  it('keeps scale at 1 when the board already fits', () => {
    expect(getBoardScale(320, 390)).toBe(1)
  })

  it('shrinks the board to fit narrow mobile widths', () => {
    expect(getBoardScale(684, 390)).toBeCloseTo(358 / 684, 5)
  })

  it('returns 1 for invalid measurements', () => {
    expect(getBoardScale(0, 390)).toBe(1)
    expect(getBoardScale(684, 0)).toBe(1)
  })
})
