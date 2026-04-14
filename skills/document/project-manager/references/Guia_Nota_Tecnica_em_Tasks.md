# Guia — Nota técnica em Tasks

Referência para a skill `project-manager` e para equipas. Especificação normativa: [[07-nota-tecnica-templates-e-user-stories]].

## Para que serve

| Secção                                      | Quem preenche                       | Função                                                                                                         |
| ------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Critérios de aceitação** (ou equivalente) | PO / equipa                         | O que tem de ser verdade para a Task ser aceite.                                                               |
| **Evidências**                              | Dev + revisão                       | O que se apresenta para **provar** que os critérios foram cumpridos (prints, links, PR, testes).               |
| **Nota técnica**                            | Líder técnico (com input da equipa) | **Ressalvas, observações e instruções** para quem **executa** — o que merece atenção extra durante o trabalho. |

A Nota técnica **não** duplica critérios de aceitação nem substitui documentação de domínio em `docs/project-manager/20-Dominio/**` (ou pasta equivalente acordada); **aponta** riscos, padrões obrigatórios, armadilhas e decisões já tomadas que o dev precisa respeitar.

## Exemplos do que entra na Nota técnica

- «Usar sempre transação ao criar X e Y; ver [[ADR-…]].»
- «Não expor endpoint sem `RolesGuard`; módulo Z é sensível.»
- «Dependência da Task [[TASK NN - …]] estar merged antes.»
- «Performance: evitar N+1 neste fluxo; usar o padrão do Provider já existente.»

## Exemplos do que **não** entra

- Lista de screenshots pedidos como evidência (isso vai em **Evidências**).
- Critério testável do tipo «O utilizador consegue fazer login» (isso é **aceitação**).

## Quando está vazia

Se não houver nada a assinalar, manter a secção com uma linha explícita, por exemplo: _Sem ressalvas técnicas adicionais._
