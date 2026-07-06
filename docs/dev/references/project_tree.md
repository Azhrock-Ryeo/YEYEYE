Project Tree:

root/
    - backend/
        - (Any Tech Stack) : NOTE
        "We intentionally did not standardize on a single backend language because the choice is highly dependent on the project's requirements. Some applications may not require a backend, while others demand high performance and may benefit from technologies such as Rust. In other cases, Node.js may be the most suitable option due to its development speed and ecosystem. The backend stack should always be chosen based on the specific goals and constraints of the project."
        - Dockerfile

    - frontend/
        - public/
            - wasm/
                - *.wasm
        - src/
            - app/
                - api/
                    - *.ts
                - pages/
                    - *.tsx
                - globals.css
                - layout.tsx
                - page.tsx
            
            - utils/
                - <module_name>/
                    - types.ts
                    - index.ts
                    - README.md
            - lib/
                - <module_name>/
                    - types.ts
                    - index.ts
                    - README.md
            - components/
                - <module_name>/
                    - styles.css
                    - types.ts
                    - index.tsx
                    - README.md
            - module/
                - <module_name>/
                    - pavillion.module.json
            - wasm/
                - *.cpp
        - eslint.config.mjs
        - next.config.ts
        - tsconfig.json
        - postcss.config.mjs
        - package-lock.json
        - package.json
        - .gitignore
        - Dockerfile
    
    - docs/
        - dev/
            - commands/
                - docker.md
            - references/
                - project_tree.md
    
    - .gitignore
    - docker-compose.yaml
    - LICENSE
    - README.md