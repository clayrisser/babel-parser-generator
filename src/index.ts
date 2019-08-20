import _ from 'lodash';
import generate from '@babel/generator';
import template from '@babel/template';
import { File, Statement } from '@babel/types';
import { parse, ParserOptions } from '@babel/parser';
import { DeepArray } from './types';

export default class BabelParserGenerator {
  ast: File;

  options: ParserOptions = {};

  constructor(code = '') {
    this.ast = parse(code, this.options);
  }

  templateAst(
    code: string,
    codePath?: string | DeepArray<string>
  ): Statement | Statement[] {
    if (Array.isArray(codePath)) {
      codePath = _.flattenDeep(codePath)
        .filter((s: string) => s.length)
        .join('.');
    }
    if (codePath) {
      return _.get(template.ast(code, this.options), codePath);
    }
    return template.ast(code, this.options);
  }

  forEach(
    values: any[],
    cb: (value: any, i: number, count: number) => number
  ): number {
    let count = 0;
    values.forEach((value: any, i: number) => {
      count = cb(value, i, count);
    });
    return count;
  }

  generate(): string {
    return generate(this.ast, {}).code;
  }

  prepend(
    code: string,
    injectPath: string | DeepArray<string> = '',
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
    injectPath: string | DeepArray<string> = '',
    codePath?: string | DeepArray<string>
  ): number {
    let templateAst = this.templateAst(code, codePath);
    if (!Array.isArray(templateAst)) templateAst = [templateAst];
    return (this.setAst(injectPath, [
      ...(this.getAst(injectPath) as Statement[]),
      ...templateAst
    ]) as Statement[]).length;
  }

  getAst(injectPath: string | DeepArray<string> = ''): Statement | Statement[] {
    if (Array.isArray(injectPath)) {
      injectPath = _.flattenDeep(injectPath)
        .filter((s: string) => s.length)
        .join('.');
    }
    if (injectPath.length) return _.get(this.ast.program.body, injectPath);
    return this.ast.program.body;
  }

  setAst(
    injectPath: string | DeepArray<string> = '',
    value: Statement | Statement[]
  ): Statement | Statement[] {
    if (Array.isArray(injectPath)) {
      injectPath = _.flattenDeep(injectPath)
        .filter((s: string) => s.length)
        .join('.');
    }
    if (injectPath.length) {
      _.set(this.ast.program.body, injectPath, value);
    } else {
      this.ast.program.body = value as Statement[];
    }
    return this.getAst(injectPath);
  }
}
