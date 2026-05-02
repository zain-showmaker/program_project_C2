import { Router, type IRouter } from "express";
import { GetCategorySuggestionsParams } from "@workspace/api-zod";
import { listCategories, getSuggestionsFor } from "../lib/suggestions";

const router: IRouter = Router();

router.get("/suggestions/categories", (_req, res) => {
  res.json(listCategories());
});

router.get("/suggestions/:category", (req, res) => {
  const parsed = GetCategorySuggestionsParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.json(getSuggestionsFor(parsed.data.category));
});

export default router;
