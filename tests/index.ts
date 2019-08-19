import BabelParserGenerator from '../src';

describe('new BabelParserGenerator()', () => {
  it('should create an instance', async () => {
    expect(new BabelParserGenerator()).toMatchObject({
      ast: {},
      options: {}
    });
  });
});

describe('new BabelParserGenerator(code)', () => {
  it('should create ast', async () => {
    expect(new BabelParserGenerator("const hello = 'world'").ast).toMatchObject(
      {
        program: {
          body: [
            {
              declarations: [{ id: { name: 'hello' } }]
            }
          ]
        }
      }
    );
  });
});

describe('new BabelParserGenerator(code).append(code)', () => {
  it('should create ast', async () => {
    const babelParserGenerator = new BabelParserGenerator(
      "const hello = 'world'"
    );
    babelParserGenerator.append("const howdy = 'texas'");
    expect(babelParserGenerator.ast).toMatchObject({
      program: {
        body: [
          {
            declarations: [{ id: { name: 'hello' } }]
          },
          {
            declarations: [{ id: { name: 'howdy' } }]
          }
        ]
      }
    });
  });
});

describe('new BabelParserGenerator(code).prepend(code)', () => {
  it('should create ast', async () => {
    const babelParserGenerator = new BabelParserGenerator(
      "const hello = 'world'"
    );
    babelParserGenerator.prepend("const howdy = 'texas'");
    expect(babelParserGenerator.ast).toMatchObject({
      program: {
        body: [
          {
            declarations: [{ id: { name: 'howdy' } }]
          },
          {
            declarations: [{ id: { name: 'hello' } }]
          }
        ]
      }
    });
  });
});
