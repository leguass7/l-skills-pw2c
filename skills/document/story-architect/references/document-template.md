# 🚀 Template de História de Usuário

## 1. O Enunciado (Formato Padrão)

**Como** [persona/tipo de usuário],
**eu quero** [realizar uma ação/funcionalidade],
**para que** [eu obtenha este benefício/valor].

> **Exemplo:** Como **cliente recorrente**, eu quero **salvar meus dados de cartão de crédito**, para que **minhas compras futuras sejam mais rápidas**.

---

## 2. Contexto e Protótipo

- **Contexto:** Explique brevemente o "porquê" ou o problema que estamos resolvendo.
- **Design/UI:** [Link para o Figma/Adobe XD]

---

## 3. Critérios de Aceite (O "Checklist" da Vitória)

Utilizamos o formato **Gherkin** (Dado que... Quando... Então...) para evitar ambiguidades:

- **Cenário 1: [Título do Cenário]**
- **Dado que** [contexto inicial],
- **Quando** [ação do usuário],
- **Então** [resultado esperado].

- **Cenário 2: [Fluxo de Exceção/Erro]**
- **Dado que** [contexto],
- **Quando** [ação],
- **Então** [mensagem de erro ou comportamento alternativo].

---

## 4. Regras de Negócio e Restrições

- [Ex: O sistema deve aceitar apenas bandeiras Visa e Mastercard.]
- [Ex: A senha deve ter no mínimo 8 caracteres.]

---

## 5. Definição de Pronto (DoD - Definition of Done)

- [ ] Código revisado (Code Review).
- [ ] Testes unitários passando.
- [ ] Documentação técnica atualizada.
- [ ] Validado em ambiente de Staging.

---

## 💡 Dicas de Ouro para o seu Time

### Use o Método INVEST

Para saber se a sua história está boa, verifique se ela é:

1. **I**ndependente (pode ser desenvolvida sozinha).
2. **N**egociável (aberta a discussões entre PO e Time).
3. **V**aliosa (traz benefício real ao usuário).
4. **E**stimável (o time consegue prever o esforço).
5. **S**mall (pequena o suficiente para caber em uma Sprint).
6. **T**estável (existem critérios claros para aprovação).

### Evite o "Tech Talk" no Enunciado

Tente manter o topo da história focado no usuário. Detalhes técnicos como "Criar uma tabela no banco de dados" devem ser **Subtasks** e não a história principal.
