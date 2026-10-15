# OpenCode Docker Sandbox Setup Instructions

This document provides complete, executable instructions for setting up **OpenCode** inside a secure, sandboxed Docker container using Visual Studio Code.

---

## Step 1: Create Configuration Files

Create the following three files in the root of your project directory.

### 1. Dockerfile
Create a file named `Dockerfile` with this exact content:
```dockerfile
FROM ubuntu:24.04

# Install basic dependencies and NodeJS
RUN apt-get update && apt-get install -y \
    curl \
    git \
    sudo \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install OpenCode CLI globally
RUN npm install -g opencode-ai@latest

# Create a non-root developer user for safety
RUN useradd -m -s /bin/bash ubuntu && \
    echo "ubuntu ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER ubuntu
WORKDIR /workspace

# Start OpenCode by default
CMD ["opencode"]
```

### 2. docker-compose.yml
Create a file named `docker-compose.yml` with this exact content:
```yaml
version: '3.8'

services:
  opencode-agent:
    build: .
    container_name: opencode_sandbox
    stdin_open: true
    tty: true
    # Security: Drop root capabilities to prevent container escapes
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true
    volumes:
      # Mount current workspace directory into the safe container environment
      - .:/workspace
      # Persist configuration and login sessions locally on your host machine
      - opencode_config:/home/ubuntu/.config/opencode
      - opencode_local:/home/ubuntu/.local
    environment:
      - TERM=xterm-256color

volumes:
  opencode_config:
  opencode_local:
```

### 3. .dockerignore
Create a file named `.dockerignore` with this exact content:
```text
node_modules
.git
.env
```

---

## Step 2: Build and Run the Sandbox

Run these commands sequentially in your VS Code terminal to build the environment and start the container:

```bash
# 1. Build the secure sandbox image
docker compose build

# 2. Launch the interactive container session
docker compose run --rm opencode-agent
```

---

## Step 3: Connect to Models Inside the Container

Once the OpenCode terminal interface loads inside your running container, execute these initial interactive commands:

1. Type `/connect` and press **Enter** to open the provider setup screen.
2. Select **OpenCode Zen** for free cloud models, or select **Gemini** to use your own free API key.
3. Follow the authentication URL provided in the terminal to get your access token, paste it back, and hit **Enter**.
4. Type `/init` to index your workspace files safely inside the sandbox.
