packer {
  required_plugins {
    googlecompute = {
      version = ">= 0.0.1"
      source  = "github.com/hashicorp/googlecompute"
    }
  }
}

source "googlecompute" "centos" {
  project_id              = var.project_id
  zone                    = var.zone
  source_image_family     = var.source_image_family
  source_image_project_id = var.source_image_project
  ssh_username            = "centos"
  image_name              = var.image_name
}

build {
  sources = [
    "source.googlecompute.centos",
  ]

  provisioner "file" {
    source      = "./tf-packer.pub"
    destination = "/tmp/tf-packer.pub"
  }

  provisioner "shell" {
    script = "../scripts/sshSetUp.sh"
  }

  provisioner "file" {
    source      = "../scripts/databaseSetup.sh"
    destination = "/tmp/databaseSetup.sh"
  }

  provisioner "shell" {
    inline = [
      "chmod +x /tmp/databaseSetup.sh",
      "sh /tmp/databaseSetup.sh"
    ]
  }

  provisioner "file" {
    source      = "../scripts/environmentSetUp.sh"
    destination = "/tmp/environmentSetUp.sh"
  }

  provisioner "shell" {
    inline = [
      "chmod +x /tmp/environmentSetUp.sh",
      "sh /tmp/environmentSetUp.sh"
    ]
  }

}
