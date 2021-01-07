provider "aws" {
  region = "ap-southeast-2"
}

variable "server_port" {
  description = "The port the server will use for HTTP requests"
  type        = number
  default     = 80
}

resource "aws_security_group" "tf_sg" {
  name = "terraform-example-sg"

  ingress {
    from_port   = var.server_port
    to_port     = var.server_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = var.server_port
    to_port     = var.server_port
    protocol    = "tcp"
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_launch_configuration" "example" {
  image_id        = "ami-06ce513624b435a22"
  instance_type   = "t2.micro"
  security_groups = [aws_security_group.tf_sg.id]
  name_prefix     = "terraform-lc-example-"
  
  user_data = <<-EOF
                #!/bin/bash
                sudo su
                yum update -y
                yum install -y httpd.x86_64
                systemctl start httpd.service
                systemctl enable httpd.service
                echo “Hello World from $(hostname -f) on port ${var.server_port}”  > /var/www/html/index.html
              EOF

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "example" {
  launch_configuration = aws_launch_configuration.example.id
  availability_zones   = data.aws_availability_zones.all.names
  
  min_size = 2
  max_size = 10
  tag {
    key                 = "Name"
    value               = "terraform-asg-example"
    propagate_at_launch = true
  }
}

data "aws_vpc" "default" {
    default = true
}

data "aws_availability_zones" "all" {}
data "aws_subnet_ids" "all" {
    vpc_id = data.aws_vpc.default.id
}

output "aws_av_default_vpc" {
  value = data.aws_vpc.default
  description = "AWS default VPC"
}

output "aws_av_zones" {
  value = data.aws_availability_zones.all.names
  description = "AWS availability zones"
}

output "aws_subnets" {
  value = data.aws_subnet_ids.all.ids
  description = "AWS default VPC subnets"
}

locals {
    vpc_id = data.aws_vpc.default.id
    subnet_ids = data.aws_subnet_ids.all.ids
}


resource "aws_alb" "alb" {  
  name            = "terraform-alb-example"  
  subnets         = local.subnet_ids
  security_groups = [aws_security_group.tf_sg.id]
  internal        = false  
}

resource "aws_alb_listener" "alb_listener" {  
  load_balancer_arn = aws_alb.alb.arn  
  port              = var.server_port  
  protocol          = "HTTP"
  
  default_action {    
    target_group_arn = aws_alb_target_group.alb_target_group.arn
    type             = "forward"  
  }
}

resource "aws_alb_target_group" "alb_target_group" {  
  name     = "terraform-alb-target-sample"  
  port     = "80"  
  protocol = "HTTP"  
  vpc_id   = local.vpc_id   

  health_check {    
    healthy_threshold   = 5    
    unhealthy_threshold = 2    
    timeout             = 5    
    interval            = 10    
    path                = "/"    
    port                = "80"
    protocol       = "HTTP"  
  }
}

resource "aws_autoscaling_attachment" "asg_attachment" {
  autoscaling_group_name = aws_autoscaling_group.example.id
  alb_target_group_arn   = aws_alb_target_group.alb_target_group.arn
}