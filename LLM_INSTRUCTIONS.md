# Code Generation Instructions

## User Interactions

- If the user asks for a plan, proposal, explanation, or guidance, respond ONLY with a proposed plan; do NOT start implementing 
- When answering questions, don't write code unless explicitly asked

## Repository Overview

### Project Structure

- `src/` - Main library source code
- `example-app/` - Demo application showing library usage
- `scripts/` - Build and release automation scripts
- `.github/workflows/` - CI/CD pipelines
- Test files are in `__tests__/` directories

### Coding Standards

- Define constants/variables; no "magic" string or numbers
- Avoid excessive nesting
- Be declarative
- Prefer array methods over imperative loops
- Run `npm run lint` regularly to check for lint errors

### Typescript

- Use strict, strong typing
- Explicitly type function returns unless unusually complex
- Do not use classes; use function builder patterns
- Use types, not interfaces
- Use explicit type imports
- Avoid enums, use constants and string literal types
- Run `npm run typecheck` to check typing whenever you finish editing a typescript file

### React

- When creating React components:
  - Create them using the function keyword
  - Type their props explicitly
  - Type the return type explicitly using React.JSX.Element and, if appropriate, null
  - Put display text in a `text: Record<string,string>` object outside of component scope
  - Do not destructure props; this makes it clear when values come from props
  - Do not use React.FC
  - Do not use ReactNode
  - Example:

  ```typescript
    const text = {
      enabled: "Enabled"
    }

    export function MyComponent(props:{ isEnabled: boolean }):React.JSX.Element { 
        return (
          <div>
            {props.isEnabled && <p>{text.enabled}</p>}
          </div>
        )
    }
  ```

### CSS

- Use SASS (.scss)
- Use variables to define colors
- Use rgba() not hexcodes for colors

### Testing

- Use `npm run test:once` to run tests, if it exists.
- If it does not exist, suggest creating it to the developer.
- Do not run `npm run test`; it runs in watch mode and will block you.
