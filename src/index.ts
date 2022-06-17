import { Annotations, Duration, Stack } from 'aws-cdk-lib';
import { Rule, RuleProps } from 'aws-cdk-lib/aws-events';
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { DeduplicationScope, Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

/**
 * Properties for the SingleDeliveryEvent construct.
 * @experimental
 */
export interface SingleDeliveryEventProps extends RuleProps {
  /**
   * Lambda Function to set as the target of the underlying SQS queue.
   */
  readonly targetFunction?: IFunction;
}

/**
 * An AWS Events Rule that delivers to a deduplicating FIFO SQS Queue rather than directly to its target.
 * @experimental
 */
export class SingleDeliveryEvent extends Construct {
  public readonly rule: Rule;
  public readonly queue: Queue;
  private readonly bound: boolean;

  constructor(scope: Construct, id: string, props: SingleDeliveryEventProps) {
    super(scope, id);
    this.bound = false;

    if (props.targets) {Annotations.of(this).addWarning('The "targets" property of this construct is ignored. Provide the targetFunction prop, or call this.bindToLambdaFunction() instead.');}

    this.queue = new Queue(this, 'DeduplicationQueue', {
      visibilityTimeout: Duration.minutes(15),
      contentBasedDeduplication: true,
      deduplicationScope: DeduplicationScope.QUEUE,
      fifo: true,
    });

    this.rule = new Rule(this, 'SingleDeliveryEventRule', {
      description: props.description,
      enabled: props.enabled,
      eventBus: props.eventBus,
      eventPattern: props.eventPattern,
      ruleName: props.ruleName,
      schedule: props.schedule,
      targets: [new SqsQueue(this.queue)],
    });

    if (props.targetFunction) {
      this.bindToLambdaFunction(props.targetFunction);
      this.bound = true;
    }
  }

  /**
   * Binds the underlying SQS Queue as an event source for the provided Function.
   * Function must be in the same stack as the SingleDeliveryEvent construct.
   * @param target
   */
  public bindToLambdaFunction(target: IFunction): void {
    if (this.bound) {Annotations.of(this).addWarning('Target Function was previously set and is being set again. Consider removing redundant bindings.');}
    if (Stack.of(target) === Stack.of(this)) {
      target.addEventSource(new SqsEventSource(this.queue));
    } else {
      Annotations.of(this).addError('Target function must be a member of the same stack in order to have its triggers set.');
    }
  }
}
