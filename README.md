# Terraform/Terraform.CDK/AWS.CDK Beginner workshop

The goal of this workshop is to provide developers and cloud engineers with basic understanding of the emerging Terraform CDK (CDK.TF) - what capabilities it has and how does it compare to classic Hashicorp Configuration Language and AWS CDK on the other side.
Terraform CDK developed by Hashicorp team: [Terraform CDK project](https://github.com/hashicorp/terraform-cdk) 

# Content
1. Problem to solve and Solution Architecture
2. Classic Terraform approach
3. Terraform CDK approach
4. How Terraform CDK is implemented
4.1 AWS CDK design as a foundation for Terraform CDK
4.2 Terraform CDK implementation
5. AWS CDK solution

This repo contains CDK TF based project alogn with the same infrastructure implemented in the native Terraform language (HCL)

At the moment of writing the CDK is still in the alpha state and a such could not be catered for the production setup

## Solution architecture
The solution is a simple web server which returns static content and is hosted on EC2s from a Autoscaling Group. The content is served through an Application Load Balancer. The diagram below provides a high level view of the infrastructure to experiment with:

![Sample architecture](https://github.com/yubelenky/tf_experiment/blob/main/images/SampleSolution.jpg?raw=true)
EC2 instance inside ASG has a web server installed (Httpd) with a static page in the root folder

The following AWS components are being created:
1.	Security Group
2.	Launch Configuration
3.	Autoscaling Group
4.	Application Load Balancer
5.	ALB Target Group
6.	Autoscaling Attachment
7.	ALB Listener

## Content of the repo

This repo has 2 independent ways to create the same architecture
1. Baseline - create with classic Terraform HCL
./tf_native/main.tf

2. Experiment using CDK.TF - root folder
./main.ts


## Test

To test that the solution is properly create point a web browser to http://*ALB DNS*.
It should return "Hello world from host *hostname* on port 80". 
