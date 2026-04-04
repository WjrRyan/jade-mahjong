export function getBoardScale(
  boardWidth: number,
  containerWidth: number,
  horizontalPadding = 16,
): number {
  if (boardWidth <= 0 || containerWidth <= 0) {
    return 1
  }

  const safeWidth = Math.max(containerWidth - horizontalPadding * 2, 0)
  if (safeWidth <= 0) {
    return 1
  }

  if (boardWidth <= safeWidth) {
    return 1
  }

  return safeWidth / boardWidth
}
