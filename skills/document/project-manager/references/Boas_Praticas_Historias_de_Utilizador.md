# Boas práticas — Histórias de utilizador (referência comunitária)

Guia para redigir **Stories** orientadas a valor, alinhado a práticas amplamente adoptadas em Agile/Scrum. Spec relacionada: [[07-nota-tecnica-templates-e-user-stories]].

## INVEST (resumo)

Cada história deve ser, tanto quanto possível:

- **I**ndependente — pode ser priorizada e entregue sem depender de outra história no mesmo nível de detalhe.
- **N**egociável — o «como» não está fechado demasiado cedo; conversa com o PO.
- **V**aliosa — entrega valor ao utilizador ou ao negócio.
- **E**stimável — a equipa consegue dimensionar o esforço.
- **S**mall — pequena o suficiente para caber num sprint (ou na unidade de planeamento do projeto).
- **T**estável — critérios permitem verificar se está feita.

## Formato de narrativa (Connextra / «três linhas»)

Estrutura clássica:

> **Como** [tipo de utilizador / persona]  
> **Quero** [acção ou necessidade]  
> **Para** [benefício ou resultado]

Evitar histórias que são apenas tarefas técnicas («instalar X»); preferir o resultado para o utilizador. Histórias puramente técnicas podem existir com outro formato, desde que o projeto o documente.

## Critérios de aceitação

- Preferir critérios **testáveis** e **sem ambiguidade**.
- Estilos comuns (escolher um e ser consistente no projeto):
  - Lista de bullets verificáveis.
  - Cenários **Dado / Quando / Então** (Given / When / Then) para regras de negócio mais densas.

## Definition of Ready (DoR) e Definition of Done (DoD)

- **DoR** — o que tem de ser verdade **antes** de a Story entrar em desenvolvimento (dependências claras, UX definida se necessário, critérios acordados).
- **DoD** — o que tem de ser verdade **para** considerar a Story concluída (testes, revisão, documentação mínima, etc.).

Fixar DoR/DoD ao nível do **equipa** ou do **repositório**, não repetir parágrafos inteiros em cada Story — **referenciar** uma nota única quando existir.

## Tag e nível

- Em Stories com foco em utilizador, usar a tag de domínio `pm/user-story` quando aplicável (ver modelo de tags em [[05-modelo-campos-clickup-e-markdown]]).

## Evolução

Este ficheiro é **referência viva**: a comunidade e o projeto podem acrescentar secções (acessibilidade, i18n, métricas de sucesso). Registar mudanças relevantes no histórico do Git.
