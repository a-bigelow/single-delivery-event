import { awscdk } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'a-bigelow',
  authorAddress: 'adam@adambigelow.com',
  cdkVersion: '2.28.0',
  defaultReleaseBranch: 'main',
  name: 'single-delivery-event',
  projenrcTs: true,
  release: false,
  repositoryUrl: 'https://github.com/a-bigelow/single-delivery-event.git',
});
project.synth();