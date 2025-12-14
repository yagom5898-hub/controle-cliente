import express from "express";
import { getPrisma } from "../prisma/client.js";

const router = express.Router();

router.get("/clientes", async (req, res) => {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      res.status(500).json({ error: "DATABASE_URL inválida ou ausente" });
      return;
    }
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const where =
      q.length > 0
        ? {
            OR: [
              { nome: { contains: q, mode: "insensitive" } },
              { telefone: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined;
    const clientes = await prisma.cliente.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(clientes);
  } catch {
    res.status(400).json({ error: "Falha ao listar clientes" });
  }
});

router.post("/clientes", async (req, res) => {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      res.status(500).json({ error: "DATABASE_URL inválida ou ausente" });
      return;
    }
    const { nome, telefone, email, servico, observacoes } = req.body || {};
    const nomeOk = typeof nome === "string" && nome.trim().length > 0;
    const telOk = typeof telefone === "string" && telefone.trim().length > 0;
    if (!nomeOk || !telOk) {
      res.status(400).json({ error: "Nome e telefone são obrigatórios" });
      return;
    }
    const created = await prisma.cliente.create({
      data: {
        nome: String(nome).trim(),
        telefone: String(telefone).trim(),
        email: email ? String(email).trim() : null,
        servico: servico ? String(servico).trim() : null,
        observacoes: observacoes ? String(observacoes).trim() : null,
      },
    });
    res.status(201).json(created);
  } catch {
    res.status(400).json({ error: "Falha ao criar cliente" });
  }
});

router.put("/clientes/:id", async (req, res) => {
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
    const { nome, telefone, email, servico, observacoes } = req.body || {};
    const data = {
      nome: nome !== undefined ? String(nome).trim() : undefined,
      telefone: telefone !== undefined ? String(telefone).trim() : undefined,
      email: email !== undefined ? (email ? String(email).trim() : null) : undefined,
      servico: servico !== undefined ? (servico ? String(servico).trim() : null) : undefined,
      observacoes:
        observacoes !== undefined ? (observacoes ? String(observacoes).trim() : null) : undefined,
    };
    const updated = await prisma.cliente.update({
      where: { id },
      data,
    });
    res.json(updated);
  } catch {
    res.status(400).json({ error: "Falha ao atualizar cliente" });
  }
});

router.delete("/clientes/:id", async (req, res) => {
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
    await prisma.cliente.delete({ where: { id } });
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "Falha ao excluir cliente" });
  }
});

export default router;

