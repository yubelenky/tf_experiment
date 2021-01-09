# Experiments with Terraform and Terraform CDK (cdktf)

## Purpose of the experiment
As a developer I would like to understand what capabilities CDK TF introduces compare to using classic Hashicorp Configuration Language and how difficult/easy to use it.
This experiment is on the Terraform CDK developed by Hashicorp team: [Terraform CDK project](https://github.com/hashicorp/terraform-cdk) 

This repo contains CDK TF based project alogn with the same infrastructure implemented in the native Terraform language (HCL)

At the moment of writing the CDK is still in the alpha state and a such could not be catered for the production setup

## Solution architecture
The solution is a simple web server which returns static content and is hosted on EC2s from a Autoscaling Group. The content is served through an Application Load Balancer. The diagram below provides a high level view of the infrastructure to experiment with:

![Sample architecture](https://github.com/yubelenky/tf_experiment/blob/main/SampleSolution.jpg?raw=true
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
