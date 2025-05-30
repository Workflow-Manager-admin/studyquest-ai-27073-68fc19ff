#!/bin/bash
cd /home/kavia/workspace/code-generation/studyquest-ai-27073-68fc19ff/studyquest_ai
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

