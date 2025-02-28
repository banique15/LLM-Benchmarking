import { Router, Request, Response, NextFunction } from 'express';
import { BenchmarkController } from '../controllers/BenchmarkController';

const router = Router();
const benchmarkController = new BenchmarkController();

// Helper function to convert controller methods to Express middleware
const adaptRoute = (
  controllerFn: (req: Request, res: Response) => Promise<void | Response>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controllerFn(req, res);
    } catch (error) {
      next(error);
    }
  };
};

// Model routes
router.get('/models', adaptRoute(benchmarkController.getModels.bind(benchmarkController)));
router.post('/models', adaptRoute(benchmarkController.registerModel.bind(benchmarkController)));
router.get('/models/openrouter', adaptRoute(benchmarkController.getOpenRouterModels.bind(benchmarkController)));

// Benchmark routes - order matters! More specific routes first
router.get('/benchmarks/status', adaptRoute(benchmarkController.getBenchmarkRuns.bind(benchmarkController)));
router.get('/benchmarks', adaptRoute(benchmarkController.getBenchmarks.bind(benchmarkController)));
router.post('/benchmarks/run', adaptRoute(benchmarkController.runBenchmark.bind(benchmarkController)));
router.get('/benchmarks/:benchmarkId/test-cases', adaptRoute(benchmarkController.getTestCases.bind(benchmarkController)));

// Benchmark run routes
router.get('/benchmark-runs/:runId', adaptRoute(benchmarkController.getBenchmarkRunStatus.bind(benchmarkController)));
router.get('/benchmark-runs/:runId/results', adaptRoute(benchmarkController.getBenchmarkResults.bind(benchmarkController)));

export default router; 