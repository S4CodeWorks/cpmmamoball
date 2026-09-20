# Diretrizes de Contribuição — CPM MamoBall

Agradecemos o interesse em contribuir com o ecossistema da **CPM MamoBall**! Para garantir um desenvolvimento ágil, código sustentável e colaboração profissional, siga os padrões descritos neste documento.

---

## 1. Princípios de Desenvolvimento

1. **Mobile-First com Adaptação para Desktop**: A aplicação foi desenhada primariamente para navegação em dispositivos móveis, com adaptação fluida para telas amplas (`useIsDesktop`).
2. **TypeScript Estrito**: Tipagem precisa em `lib/types.ts`. Evite o uso de `any`.
3. **Consistência Visual e Temática**: Respeite os tokens de cor (`globals.css`, variáveis `--primary`, `--surface`, `--on-surface-variant`, etc.).
4. **Performance & Estabilidade**: Utilize componentes desacoplados, minimizando re-renders e chamadas síncronas em effects.

---

## 2. Fluxo de Trabalho (Git Workflow)

1. **Fork ou Crie uma Branch**:
   ```bash
   git checkout -b feature/nome-da-funcionalidade
   # ou para correções:
   git checkout -b fix/descricao-do-bug
   ```

2. **Convenção de Commits**:
   Utilizamos o padrão [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` Nova funcionalidade
   - `fix:` Correção de bug
   - `docs:` Alterações na documentação
   - `style:` Formatação ou ajustes de estilo sem alteração de lógica
   - `refactor:` Refatoração de código
   - `perf:` Melhorias de performance
   - `test:` Adição ou modificação de testes
   - `chore:` Tarefas de manutenção ou dependências

   *Exemplo:* `feat: add live match penalty shootout indicators`

3. **Validação Local Obrigatória**:
   Antes de abrir um Pull Request, certifique-se de que o build compila com sucesso:
   ```bash
   npm run build
   ```

4. **Abra um Pull Request**:
   - Forneça uma descrição clara das mudanças.
   - Inclua prints ou vídeos demonstrativos de mudanças na interface.
   - Vincule a issue correspondente quando aplicável.

---

## 3. Estrutura do Banco de Dados & Migrações

- O arquivo [supabase/schema.sql](supabase/schema.sql) é a fonte de verdade do banco de dados relacional.
- Qualquer alteração em tabelas, enums ou políticas de Row Level Security (RLS) deve ser refletida tanto no schema quanto nas definições de tipos em `lib/types.ts`.

---

## 4. Código de Conduta

Esperamos um ambiente de respeito mútuo, comunicação construtiva e foco na excelência técnica em todas as discussões, issues e revisões de código.
