import { Router, Request, Response } from 'express';
import * as projectsController from '../controllers/projects';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await projectsController.getAllProjects();
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const project = await projectsController.getProjectById(id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    res.json(project);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, items, svg_snapshot } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const project = await projectsController.createProject(
      name,
      items || [],
      svg_snapshot
    );
    res.status(201).json(project);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const { name, items, svg_snapshot } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const project = await projectsController.updateProject(id, name, items || [], svg_snapshot);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    res.json(project);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const deleted = await projectsController.deleteProject(id);
    if (!deleted) return res.status(404).json({ error: 'Project not found' });

    res.json({ message: 'Project deleted', id: deleted.id });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
