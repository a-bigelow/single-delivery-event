import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { SingleDeliveryEvent } from '../src';

test('simple snapshot', () => {
  const stack = new Stack(new App(), 'TestingStack', {});
  new SingleDeliveryEvent(stack, 'test-event', {});
  const assert = Template.fromStack(stack);
  expect(assert.toJSON()).toMatchSnapshot();
});

test('queue name ends in ".fifo"', () => {
  const stack = new Stack(new App(), 'TestingStack', {});
  const event = new SingleDeliveryEvent(stack, 'test-event', {});
  expect(event.queue.queueName.endsWith('.fifo'));
});

test('binding to lambda function in separate stack throws', () => {
  const app = new App();
  const stack = new Stack(app, 'TestingStack', {});
  const lambdaStack = new Stack(app, 'LambdaStack', {});
  const testFunction = new Function(lambdaStack, 'TestFunction', {
    handler: 'handler',
    code: Code.fromInline('export async function handler(event: any) {\n' +
        '  console.log(\'Go away.\');\n' +
        '}'),
    runtime: Runtime.NODEJS_16_X,
  });
  const event = new SingleDeliveryEvent(stack, 'test-event', {});
  expect(() => {event.bindToLambdaFunction(testFunction);}).toThrow();
});

