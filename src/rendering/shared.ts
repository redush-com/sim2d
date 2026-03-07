/**
 * Clears the canvas and fills with a background color.
 * @param ctx - canvas 2D rendering context
 * @param width - canvas width in CSS pixels
 * @param height - canvas height in CSS pixels
 * @param bgColor - background fill color
 */
export function clearCanvas(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	bgColor = '#0a0a0f',
): void {
	ctx.fillStyle = bgColor;
	ctx.fillRect(0, 0, width, height);
}

/**
 * Draws a subtle grid for spatial reference.
 * @param ctx - canvas 2D rendering context
 * @param width - canvas width
 * @param height - canvas height
 * @param spacing - grid line spacing in pixels
 * @param color - grid line color
 */
export function drawGrid(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	spacing = 50,
	color = 'rgba(255, 255, 255, 0.03)',
): void {
	ctx.strokeStyle = color;
	ctx.lineWidth = 1;

	for (let x = spacing; x < width; x += spacing) {
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, height);
		ctx.stroke();
	}

	for (let y = spacing; y < height; y += spacing) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(width, y);
		ctx.stroke();
	}
}

/**
 * Draws an arrow from one point to another.
 * @param ctx - canvas 2D rendering context
 * @param fromX - start x
 * @param fromY - start y
 * @param toX - end x
 * @param toY - end y
 * @param color - arrow color
 * @param headSize - arrowhead size in pixels
 */
export function drawArrow(
	ctx: CanvasRenderingContext2D,
	fromX: number,
	fromY: number,
	toX: number,
	toY: number,
	color: string,
	headSize = 6,
): void {
	const dx = toX - fromX;
	const dy = toY - fromY;
	const angle = Math.atan2(dy, dx);

	ctx.beginPath();
	ctx.moveTo(fromX, fromY);
	ctx.lineTo(toX, toY);
	ctx.strokeStyle = color;
	ctx.lineWidth = 1.5;
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(toX, toY);
	ctx.lineTo(
		toX - headSize * Math.cos(angle - Math.PI / 6),
		toY - headSize * Math.sin(angle - Math.PI / 6),
	);
	ctx.lineTo(
		toX - headSize * Math.cos(angle + Math.PI / 6),
		toY - headSize * Math.sin(angle + Math.PI / 6),
	);
	ctx.closePath();
	ctx.fillStyle = color;
	ctx.fill();
}

/**
 * Renders a 2D heatmap from a flat array of values onto the canvas.
 * @param ctx - canvas 2D rendering context
 * @param data - flat array of values (row-major), range [0, 1]
 * @param cols - number of columns in the grid
 * @param rows - number of rows in the grid
 * @param width - canvas width
 * @param height - canvas height
 * @param colorFn - maps a value [0,1] to an rgba color string
 */
export function drawHeatmap(
	ctx: CanvasRenderingContext2D,
	data: number[],
	cols: number,
	rows: number,
	width: number,
	height: number,
	colorFn: (value: number) => string,
): void {
	const cellW = width / cols;
	const cellH = height / rows;

	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const val = data[r * cols + c];
			if (val < 0.001) continue;
			ctx.fillStyle = colorFn(val);
			ctx.fillRect(c * cellW, r * cellH, cellW + 0.5, cellH + 0.5);
		}
	}
}
