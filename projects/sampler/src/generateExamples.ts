// @ts-nocheck
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

interface InputMetadata {
  name: string;
  type: string | null;
  defaultValue: string | null;
}

interface ComponentMetadata {
  selector: string;
  standalone: boolean;
  inputs: InputMetadata[];
}

// Function to read component metadata
function readComponentMetadata(componentPath: string): ComponentMetadata {
  const componentFile = fs.readFileSync(componentPath, 'utf-8');
  const sourceFile = ts.createSourceFile(componentPath, componentFile, ts.ScriptTarget.Latest, true);
  const inputs: InputMetadata[] = [];
  let selector: string = '';
  let standalone: boolean = false;

  function visit(node: ts.Node) {
    if (ts.isClassDeclaration(node)) {
      const decorators = ts.getDecorators(node);
      decorators?.forEach(decorator => {
        if (ts.isCallExpression(decorator.expression) && decorator.expression.expression.getText() === 'Component') {
          const args = decorator.expression.arguments;
          if (args.length) {
            const componentMetadata = args[0] as ts.ObjectLiteralExpression;
            componentMetadata.properties.forEach(property => {
              if (ts.isPropertyAssignment(property)) {
                if (property.name.getText() === 'selector') {
                  selector = (property.initializer as ts.StringLiteral).text;
                } else if (property.name.getText() === 'standalone') {
                  standalone = (property.initializer.kind === ts.SyntaxKind.TrueKeyword);
                }
              }
            });
          }
        }
      });
    }
    if (ts.isPropertyDeclaration(node)) {
      const decorators = ts.getDecorators(node);
      decorators?.forEach(decorator => {
        if (ts.isCallExpression(decorator.expression) && decorator.expression.expression.getText() === 'Input') {
          const name = node.name.getText();
          const type = node.type ? node.type.getText() : null;
          const initializer = node.initializer ? node.initializer.getText() : null;
          inputs.push({name, type, defaultValue: initializer});
        }
      });
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return {selector, standalone, inputs};
}

// Function to generate example page
function generateExamplePage(componentName, metadata: ComponentMetadata) {
  const exampleHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName} Example</title>
</head>
<body>
  <${metadata.selector}
    ${metadata.inputs.map(input => `[${input.name}]=${input.defaultValue}`).join('\n\t\t')}
  >
  </${metadata.selector}>
</body>
</html>
  `;

  const exampleJs = `
    // JavaScript code to bootstrap the Angular component
    // This part will depend on your specific setup and requirements
  `;

  // Ensure the examples directory exists
  // const examplesDir = path.join(__dirname, 'examples');
  const examplesDir = path.join(__dirname, '..', '..', '..', 'src', 'examples');
  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir);
  }

  // Write the HTML and JS files
  fs.writeFileSync(path.join(examplesDir, `${componentName}.html`), exampleHtml);
  fs.writeFileSync(path.join(examplesDir, `${componentName}.js`), exampleJs);
}

// Function to process a single component
function processComponent(componentPath) {
  const componentName = path.basename(componentPath, '.component.ts');
  const metadata = readComponentMetadata(componentPath);

  generateExamplePage(componentName, metadata);
}

// Function to recursively process directories
function processDirectories(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectories(fullPath);
    } else if (file.endsWith('.component.ts')) {
      processComponent(fullPath);
    }
  });
}

// Run the script
processDirectories(path.join(__dirname, '..', '..', 'mekor-lib', 'src', 'lib'));

