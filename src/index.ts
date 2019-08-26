import _ from 'lodash';
import generate from '@babel/generator';
import template from '@babel/template';
import { File, Statement } from '@babel/types';
import { parse, ParserOptions } from '@babel/parser';
import { DeepArray, InjectPath, Substitutions } from './types';

export * from './types';

export default class BabelParserGenerator {
  ast: File;

  options: ParserOptions = {};

  reservedKeywords = new Set([
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'enum',
    'export',
    'extends',
    'false',
    'finally',
    'for',
    'function',
    'if',
    'implements',
    'import',
    'in',
    'instanceof',
    'interface',
    'let',
    'new',
    'package',
    'private',
    'protected',
    'public',
    'return',
    'static',
    'super',
    'switch',
    'this',
    'throw',
    'true',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield'
  ]);

  constructor(code = '') {
    this.ast = parse(code, this.options);
  }

  isReservedKeyword(keyword: string) {
    return this.reservedKeywords.has(keyword);
  }

  safeWord(keyword: string) {
    if (!this.isReservedKeyword(keyword)) return keyword;
    return `_${keyword}`;
  }

  templateAst(
    code: string,
    codePath?: string | DeepArray<string>,
    substitutions?: Substitutions
  ): Statement | Statement[] {
    if (Array.isArray(codePath)) {
      codePath = _.flattenDeep(codePath)
        .filter((s: string) => s.length)
        .join('.');
    }
    let ast: Statement | Statement[];
    if (substitutions) {
      ast = template(code, this.options)(substitutions);
    } else {
      ast = template.ast(code, this.options);
    }
    if (codePath) return _.get(ast, codePath);
    return ast;
  }

  generate(): string {
    return generate(this.ast, {}).code;
  }

  prepend(
    code: string,
    injectPath: InjectPath = '',
    codePath?: string | DeepArray<string>
  ): number {
    let templateAst = this.templateAst(code, codePath);
    if (!Array.isArray(templateAst)) templateAst = [templateAst];
    return (this.setAst(injectPath, [
      ...templateAst,
      ...(this.getAst(injectPath) as Statement[])
    ]) as Statement[]).length;
  }

  append(
    code: string,
    injectPath: InjectPath = '',
    codePath?: string | DeepArray<string>
  ): number {
    let templateAst = this.templateAst(code, codePath);
    if (!Array.isArray(templateAst)) templateAst = [templateAst];
    return (this.setAst(injectPath, [
      ...(this.getAst(injectPath) as Statement[]),
      ...templateAst
    ]) as Statement[]).length;
  }

  getAst(injectPath: InjectPath = ''): Statement | Statement[] {
    if (Array.isArray(injectPath)) {
      injectPath = _.flattenDeep(injectPath)
        .filter((s: string | number) => s.toString().length)
        .join('.');
    }
    if (injectPath.toString().length)
      return _.get(this.ast.program.body, injectPath);
    return this.ast.program.body;
  }

  setAst(
    injectPath: InjectPath = '',
    value: Statement | Statement[]
  ): Statement | Statement[] {
    if (Array.isArray(injectPath)) {
      injectPath = _.flattenDeep(injectPath)
        .filter((s: number | string) => s.toString().length)
        .join('.');
    }
    if (injectPath.toString().length) {
      _.set(this.ast.program.body, injectPath, value);
    } else {
      this.ast.program.body = value as Statement[];
    }
    return this.getAst(injectPath);
  }
}
