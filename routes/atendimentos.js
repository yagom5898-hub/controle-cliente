import express from "express";
import { getPrisma } from "../prisma/client.js";

const router = express.Router();

router.get("/clientes/:id/atendimentos", async (req, res) => {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      res.status(500).json({ error: "DATABASE_URL inválida ou ausente" });
      return;
    }
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id) || id <= 0) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }
    const items = await prisma.atendimento.findMany({
      where: { clienteId: id },
      orderBy: { createdAt: "desc" },
    });
    res.json(items);
  } catch {
    res.status(400).json({ error: "Falha ao listar atendimentos" });
  }
});

router.post("/clientes/:id/atendimentos", async (req, res) => {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      res.status(500).json({ error: "DATABASE_URL inválida ou ausente" });
      return;
    }
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id) || id <= 0) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }
    const { data, servico, valor, observacoes } = req.body || {};
    const dataObj = data ? new Date(data) : new Date();
    if (Number.isNaN(dataObj.getTime())) {
      res.status(400).json({ error: "Data inválida" });
      return;
    }
    const valorNum =
      valor === undefined || valor === null || valor === ""
        ? null
        : Number.parseFloat(valor);
    if (valorNum !== null && !Number.isFinite(valorNum)) {
      res.status(400).json({ error: "Valor inválido" });
      return;
    }
    const created = await prisma.atendimento.create({
      data: {
        clienteId: id,
        data: dataObj,
        servico: servico ? String(servico).trim() : null,
        valor: valorNum,
        observacoes: observacoes ? String(observacoes).trim() : null,
      },
    });
    res.status(201).json(created);
  } catch {
    res.status(400).json({ error: "Falha ao criar atendimento" });
  }
});

export default router;

