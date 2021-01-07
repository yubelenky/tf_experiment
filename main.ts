import { Construct } from 'constructs';
import { App, TerraformStack } from 'cdktf';
import * as AwsTypes from "./.gen/providers/aws";

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsTypes.AwsProvider(this, "aws", {
      region: "ap-southeast-2",
    });
    
    const createEgressRules = function () {
      const egress : AwsTypes.SecurityGroupEgress = {
        fromPort : 0, 
        toPort : 0, 
        cidrBlocks : ["0.0.0.0/0"], 
        protocol : "-1",
        description : "All",
        securityGroups : [],
        ipv6CidrBlocks : [],
        prefixListIds : [],
        selfAttribute : false,
      };

      return [egress];
    }

    const createIngressRules = function (serverPort : number) {
      const ingress1 : AwsTypes.SecurityGroupIngress = {
        fromPort : serverPort, 
        toPort : serverPort, 
        cidrBlocks : ["0.0.0.0/0"], 
        protocol : "tcp",
        description : "HTTP",
        securityGroups : [],
        ipv6CidrBlocks : [],
        prefixListIds : [],
        selfAttribute : false,
      };

      const ingress2 : AwsTypes.SecurityGroupIngress = {
        fromPort : serverPort, 
        toPort : serverPort, 
        cidrBlocks : [], 
        protocol : "tcp",
        description : "HTTP",
        securityGroups : [],
        ipv6CidrBlocks : ["::/0"],
        prefixListIds : [],
        selfAttribute : false,
      };

      return [ingress1, ingress2];
    }

    const sg = new AwsTypes.SecurityGroup(this, "sg-123456");
    sg.egress = createEgressRules();
    sg.ingress = createIngressRules(80);
    sg.name = "tfcdk-example";

    const createLaunchConfigurationConfig = function() {

      const pageResponse = "\"Hello World from $(hostname -f) on port 80\"";
      const userDataText = `#!/bin/bash
      sudo su
      exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
      yum -y update
      echo "Hello from user-data!"
      yum install -y httpd.x86_64
      systemctl start httpd.service
      systemctl enable httpd.service
      echo ${pageResponse}  > /var/www/html/index.html`;

      const config : AwsTypes.LaunchConfigurationConfig = {
        imageId: "ami-06ce513624b435a22",
        instanceType: "t2.micro",
        userData: userDataText,
        namePrefix: "terraform-lc-example-"
      };

      return config;
    }

    const lc = new AwsTypes.LaunchConfiguration(this, "lc-123456", createLaunchConfigurationConfig());
    lc.lifecycle = {createBeforeDestroy: true};
    lc.securityGroups = [sg.name];

    const createASGConfig = function() {
      const config : AwsTypes.AutoscalingGroupConfig = {
        maxSize : 10,
        minSize : 2
      };

      return config;
    }
    const asg = new AwsTypes.AutoscalingGroup(this, "acg-123456", createASGConfig());
    asg.tag = [{key: "Name", value: "terraform-asg-example", propagateAtLaunch: true}];
    asg.availabilityZones = ["ap-southeast-2a", "ap-southeast-2b", "ap-southeast-2c"];
    asg.launchConfiguration = lc.id;

    const alb = new AwsTypes.Alb(this, "alb-123456");
    alb.subnets = ["subnet-0fb63ee5ddacf9f42", "subnet-031064fa468082edf", "subnet-0420314bd35fe9403"];
    alb.securityGroups = [sg.id];
    alb.internal = false;

    const targetGroup = new AwsTypes.AlbTargetGroup(this, "albtg-123456");
    targetGroup.port = 80;
    targetGroup.protocol = "HTTP";
    targetGroup.vpcId = "vpc-88d588ef";

    targetGroup.healthCheck = [{healthyThreshold: 5, unhealthyThreshold: 2, timeout: 5, interval: 10,
    path: "/", port: "80", protocol: "HTTP"}];
    
    const createALBListenerConfig = function(lbArn: string, targetArn: string) {
      const config : AwsTypes.AlbListenerConfig = {
        defaultAction: [{type: "forward", targetGroupArn: targetArn}],
        loadBalancerArn: lbArn,
        port: 80
      };

      return config;
    }
    const albListener = new AwsTypes.AlbListener(this, "albl-1234656", createALBListenerConfig(alb.arn, targetGroup.arn));
    albListener.protocol = "HTTP";

    const createAutosclaingAttachmentConfig = function(asgName: string, targetGroupArn: string) {
      const config : AwsTypes.AutoscalingAttachmentConfig = {
        autoscalingGroupName: asgName,
        albTargetGroupArn: targetGroupArn
      }

      return config;
    }
    new AwsTypes.AutoscalingAttachment(this, "asga-123456", createAutosclaingAttachmentConfig(asg.name, targetGroup.arn));
  }
}

const app = new App();
new MyStack(app, 'hello-terraform');
app.synth();
