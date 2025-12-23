import { Request, Response } from 'express';
import { leadService } from '../services/leadService';

export const leadController = {
  async create(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user) {
         res.sendStatus(401);
         return;
      }
      const lead = await leadService.createLead(user.id, req.body);
      
      const io = req.app.get('io');
      if (io) {
        io.emit('new_lead', lead);
      }

      res.status(201).json(lead);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create lead' });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
        const user = (req as any).user;
        if (!user) {
            res.sendStatus(401);
            return;
        }
        const { status, startDate, endDate } = req.query;
        const leads = await leadService.getLeads(user.id, { status, startDate, endDate });
        const stats = await leadService.getStats(user.id);
        res.json({ leads, stats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
  },
  
  async updateStatus(req: Request, res: Response) {
      try {
          const user = (req as any).user;
          if (!user) {
              res.sendStatus(401);
              return;
          }
          const { id } = req.params;
          const { status } = req.body;
          const lead = await leadService.updateLeadStatus(id, user.id, status);
          res.json(lead);
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to update lead' });
      }
  }
};
