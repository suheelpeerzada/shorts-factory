#!/bin/bash
cd /home/claude/shorts-factory; git checkout -qf --orphan tmpempty; git rm -rqf --cached . ; git commit -q --allow-empty -m empty
git push -qf origin tmpempty:media 2>&1 | grep -v -e negotiation -e acknowledgments || true; git checkout -qf main; git branch -D -q tmpempty; echo cleared
