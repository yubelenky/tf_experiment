# Experiments with Terraform and Terraform CDK (cdktf)

This repo contains CDK TF based project alogn with the same infrastructure implemented in the native Terraform language (HCL)

./ - CDKTF Typescript project
./tf_native/ - HCL version of the same code

CDK TF is based on ckdtf from the [Terraform CDK project](https://github.com/hashicorp/terraform-cdk)

The deployable infra is (for AWS):
ALB which points to ASG which contains Amazon Linux 2 EC2s with an Apache Web Server deployed at provisioning time.

Test
Point a web browser to http://*ALB DNS*.
It should return "Hello world from host *hostname* on port 80". 
