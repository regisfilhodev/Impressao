// hooks/useHistorico.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  TrabalhoHistorico,
  listarHistorico,
  adicionarHistorico,
  removerHistorico,
  limparHistorico,
  resumoDeHoje,
} from "@/lib/historico";

export function useHistorico() {
  const [trabalhos, setTrabalhos] = useState<TrabalhoHistorico[]>([]);
  const [carregado, setCarregado] = useState(false);

  const recarregar = useCallback(() => {
    setTrabalhos(listarHistorico());
  }, []);

  useEffect(() => {
    recarregar();
    setCarregado(true);
  }, [recarregar]);

  const registrar = useCallback(
    (item: Parameters<typeof adicionarHistorico>[0]) => {
      const novo = adicionarHistorico(item);
      recarregar();
      return novo;
    },
    [recarregar]
  );

  const remover = useCallback(
    (id: string) => {
      removerHistorico(id);
      recarregar();
    },
    [recarregar]
  );

  const limpar = useCallback(() => {
    limparHistorico();
    recarregar();
  }, [recarregar]);

  const resumo = resumoDeHoje(trabalhos);

  return { trabalhos, carregado, registrar, remover, limpar, resumo };
}
