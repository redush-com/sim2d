// Unit tests for src/simulations/apf-swarm/forces.ts — artificial potential field force calculations

import {
	attractiveForce,
	obstacleRepulsiveForce,
	interRobotRepulsiveForce,
	totalForce,
} from './forces';
import { magnitude } from '../../math/vector';
import type { Vec2 } from '../../types';
import type { Obstacle, ApfParams } from './types';

describe('attractiveForce', () => {
	it('points toward the goal', () => {
		const agent: Vec2 = { x: 0, y: 0 };
		const goal: Vec2 = { x: 10, y: 0 };
		const f = attractiveForce(agent, goal, 1);
		expect(f.x).toBeGreaterThan(0);
		expect(f.y).toBeCloseTo(0, 10);
	});

	it('has greater magnitude for greater distance (up to the cap)', () => {
		const agent: Vec2 = { x: 0, y: 0 };
		const nearGoal: Vec2 = { x: 1, y: 0 };
		const farGoal: Vec2 = { x: 5, y: 0 };
		const kAtt = 1;

		const fNear = attractiveForce(agent, nearGoal, kAtt);
		const fFar = attractiveForce(agent, farGoal, kAtt);

		expect(magnitude(fFar)).toBeGreaterThan(magnitude(fNear));
	});

	it('caps magnitude at MAX_ATTRACTIVE_FORCE (50)', () => {
		const agent: Vec2 = { x: 0, y: 0 };
		const farGoal: Vec2 = { x: 1000, y: 0 };
		const f = attractiveForce(agent, farGoal, 10);
		expect(magnitude(f)).toBeCloseTo(50, 5);
	});

	it('returns zero vector when agent is at the goal', () => {
		const pos: Vec2 = { x: 5, y: 5 };
		const f = attractiveForce(pos, pos, 1);
		expect(f.x).toBe(0);
		expect(f.y).toBe(0);
	});
});

describe('obstacleRepulsiveForce', () => {
	const obstacle: Obstacle = { position: { x: 5, y: 0 }, radius: 1 };

	it('pushes the agent away from the obstacle', () => {
		// Agent at (3,0), obstacle at (5,0) with radius 1 -> raw dist = 2 - 1 = 1
		const agent: Vec2 = { x: 3, y: 0 };
		const f = obstacleRepulsiveForce(agent, obstacle, 1, 5);
		expect(f.x).toBeLessThan(0); // pushed in -x direction
		expect(f.y).toBeCloseTo(0, 10);
	});

	it('returns zero beyond d0', () => {
		// Agent at (-100,0), obstacle at (5,0) -> very far
		const agent: Vec2 = { x: -100, y: 0 };
		const f = obstacleRepulsiveForce(agent, obstacle, 1, 5);
		expect(f.x).toBe(0);
		expect(f.y).toBe(0);
	});

	it('increases as the agent gets closer to the obstacle', () => {
		const d0 = 10;
		const kRep = 1;
		const far: Vec2 = { x: 0, y: 0 }; // rawDist = 5-1 = 4
		const near: Vec2 = { x: 4, y: 0 }; // rawDist = 1-1 = 0 -> clamped to 0.5

		const fFar = obstacleRepulsiveForce(far, obstacle, kRep, d0);
		const fNear = obstacleRepulsiveForce(near, obstacle, kRep, d0);

		expect(magnitude(fNear)).toBeGreaterThan(magnitude(fFar));
	});
});

describe('interRobotRepulsiveForce', () => {
	it('pushes away from the other agent', () => {
		const agent: Vec2 = { x: 0, y: 0 };
		const other: Vec2 = { x: 2, y: 0 };
		const f = interRobotRepulsiveForce(agent, other, 1, 5);
		expect(f.x).toBeLessThan(0); // pushed in -x direction
		expect(f.y).toBeCloseTo(0, 10);
	});

	it('returns zero beyond dRobot', () => {
		const agent: Vec2 = { x: 0, y: 0 };
		const other: Vec2 = { x: 100, y: 0 };
		const f = interRobotRepulsiveForce(agent, other, 1, 5);
		expect(f.x).toBe(0);
		expect(f.y).toBe(0);
	});

	it('increases as agents get closer', () => {
		const dRobot = 10;
		const far: Vec2 = { x: 0, y: 0 };
		const nearOther: Vec2 = { x: 1, y: 0 };
		const farOther: Vec2 = { x: 8, y: 0 };

		const fNear = interRobotRepulsiveForce(far, nearOther, 1, dRobot);
		const fFar = interRobotRepulsiveForce(far, farOther, 1, dRobot);

		expect(magnitude(fNear)).toBeGreaterThan(magnitude(fFar));
	});

	it('is symmetric in direction (opposite for each agent pair)', () => {
		const a: Vec2 = { x: 0, y: 0 };
		const b: Vec2 = { x: 3, y: 0 };
		const fAB = interRobotRepulsiveForce(a, b, 1, 5);
		const fBA = interRobotRepulsiveForce(b, a, 1, 5);
		// Magnitudes should be equal
		expect(magnitude(fAB)).toBeCloseTo(magnitude(fBA), 10);
		// Directions should be opposite
		expect(fAB.x).toBeCloseTo(-fBA.x, 10);
		expect(fAB.y).toBeCloseTo(-fBA.y, 10);
	});
});

describe('totalForce', () => {
	const defaultParams: ApfParams = {
		kAtt: 1,
		kRep: 1,
		kRepRobot: 1,
		d0: 10,
		dRobot: 5,
		agentCount: 2,
		maxSpeed: 5,
		trailLength: 10,
		perturbStrength: 0.1,
		stuckThreshold: 0.5,
		stuckFrames: 10,
	};

	it('returns only the attractive force when there are no obstacles or other agents', () => {
		const agent: Vec2 = { x: 0, y: 0 };
		const goal: Vec2 = { x: 10, y: 0 };
		const f = totalForce(agent, goal, [], [], defaultParams);
		const fAtt = attractiveForce(agent, goal, defaultParams.kAtt);

		expect(f.x).toBeCloseTo(fAtt.x, 10);
		expect(f.y).toBeCloseTo(fAtt.y, 10);
	});

	it('is the superposition of attractive and repulsive forces', () => {
		const agent: Vec2 = { x: 5, y: 0 };
		const goal: Vec2 = { x: 20, y: 0 };
		const obstacles: Obstacle[] = [{ position: { x: 8, y: 0 }, radius: 1 }];
		const others: Vec2[] = [{ x: 3, y: 0 }];

		const f = totalForce(agent, goal, obstacles, others, defaultParams);
		const fAtt = attractiveForce(agent, goal, defaultParams.kAtt);
		const fObs = obstacleRepulsiveForce(agent, obstacles[0], defaultParams.kRep, defaultParams.d0);
		const fRobot = interRobotRepulsiveForce(
			agent,
			others[0],
			defaultParams.kRepRobot,
			defaultParams.dRobot,
		);

		expect(f.x).toBeCloseTo(fAtt.x + fObs.x + fRobot.x, 10);
		expect(f.y).toBeCloseTo(fAtt.y + fObs.y + fRobot.y, 10);
	});

	it('sums repulsion from multiple obstacles', () => {
		const agent: Vec2 = { x: 0, y: 0 };
		const goal: Vec2 = { x: 100, y: 0 };
		const obs1: Obstacle = { position: { x: 3, y: 0 }, radius: 0.5 };
		const obs2: Obstacle = { position: { x: 0, y: 3 }, radius: 0.5 };

		const fTotal = totalForce(agent, goal, [obs1, obs2], [], defaultParams);
		const fAtt = attractiveForce(agent, goal, defaultParams.kAtt);
		const fObs1 = obstacleRepulsiveForce(agent, obs1, defaultParams.kRep, defaultParams.d0);
		const fObs2 = obstacleRepulsiveForce(agent, obs2, defaultParams.kRep, defaultParams.d0);

		expect(fTotal.x).toBeCloseTo(fAtt.x + fObs1.x + fObs2.x, 10);
		expect(fTotal.y).toBeCloseTo(fAtt.y + fObs1.y + fObs2.y, 10);
	});
});
