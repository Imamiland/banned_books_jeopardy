# GitHub Projects Setup Guide

This document provides instructions for setting up the **Banned Books Jeopardy - Development Board** GitHub Project.

## Project Overview

**Project Name**: Banned Books Jeopardy - Development Board  
**Type**: Repository-level Project  
**Purpose**: Track features, bugs, and development progress across the entire application

## Step-by-Step Setup Instructions

### 1. Create the Project

1. Go to your repository: `https://github.com/Imamiland/banned_books_jeopardy`
2. Click on the **Projects** tab
3. Click **New project**
4. Select **Board** template
5. Name it: `Banned Books Jeopardy - Development Board`
6. Click **Create project**

### 2. Configure Custom Fields

Navigate to project settings (⚙️ icon) and add the following custom fields:

#### Priority Field

- **Field name**: Priority
- **Field type**: Single select
- **Options**:
  - P0 (Critical - Immediate attention) - 🔴 Red
  - P1 (High - Next sprint) - 🟠 Orange
  - P2 (Medium - Planned) - 🟡 Yellow
  - P3 (Low - Backlog) - 🟢 Green
  - P4 (Nice to have) - 🔵 Blue

#### Size Field

- **Field name**: Size
- **Field type**: Single select
- **Options**:
  - XS (< 1 day)
  - S (1-2 days)
  - M (3-5 days)
  - L (1-2 weeks)
  - XL (> 2 weeks)

#### Type Field

- **Field name**: Type
- **Field type**: Single select
- **Options** (based on Conventional Commits):
  - feat (New feature)
  - fix (Bug fix)
  - docs (Documentation)
  - chore (Maintenance)
  - refactor (Code refactoring)
  - test (Testing)
  - perf (Performance)
  - ci (CI/CD)
  - build (Build system)
  - style (Code style)
  - revert (Revert changes)

#### Feature Area Field

- **Field name**: Feature Area
- **Field type**: Single select
- **Options**:
  - Backend (Database, API, Server)
  - Frontend (UI, Components, Styling)
  - Testing (Unit, E2E, Integration)
  - Documentation (Guides, API docs, README)
  - Infrastructure (CI/CD, Deployment, DevOps)
  - Auth & Security (Authentication, Authorization, Security)

#### Milestone Field

- **Field name**: Milestone
- **Field type**: Single select
- **Options**:
  - MVP (Minimum Viable Product)
  - Alpha (Internal testing)
  - Beta (External testing)
  - Release Candidate (Pre-release)
  - Release 1.0 (Production release)

#### Sprint Field

- **Field name**: Sprint
- **Field type**: Iteration
- **Duration**: 2 weeks
- **Start date**: (Set your first sprint start date)

#### Start Date & Target Date

- **Field name**: Start Date
- **Field type**: Date

- **Field name**: Target Date
- **Field type**: Date

### 3. Configure Board Columns

Update the default columns to match our workflow:

1. **Backlog** (Default: Todo)
2. **Todo** (Ready to start)
3. **In Progress** (Actively working)
4. **In Review** (PR created, awaiting review)
5. **Done** (Completed and closed)
6. **Blocked** (Waiting on dependencies)

### 4. Create Additional Views

#### View 1: Kanban Board (Default)

- **Name**: 📋 Kanban Board
- **Type**: Board
- **Group by**: Status
- **Sort by**: Priority (P0 → P4)
- **Filter**: None (show all)

#### View 2: Backend Features

- **Name**: 🔧 Backend
- **Type**: Board
- **Group by**: Status
- **Filter**: Feature Area = Backend
- **Sort by**: Priority

#### View 3: Frontend Features

- **Name**: 🎨 Frontend
- **Type**: Board
- **Group by**: Status
- **Filter**: Feature Area = Frontend
- **Sort by**: Priority

#### View 4: Testing

- **Name**: 🧪 Testing
- **Type**: Board
- **Group by**: Status
- **Filter**: Feature Area = Testing
- **Sort by**: Priority

#### View 5: Documentation

- **Name**: 📚 Documentation
- **Type**: Board
- **Group by**: Status
- **Filter**: Feature Area = Documentation
- **Sort by**: Priority

#### View 6: Infrastructure

- **Name**: 🏗️ Infrastructure
- **Type**: Board
- **Group by**: Status
- **Filter**: Feature Area = Infrastructure
- **Sort by**: Priority

#### View 7: Auth & Security

- **Name**: 🔒 Auth & Security
- **Type**: Board
- **Group by**: Status
- **Filter**: Feature Area = Auth & Security
- **Sort by**: Priority

#### View 8: Bug Tracker

- **Name**: 🐛 Bug Tracker
- **Type**: Table
- **Filter**: Type = fix
- **Sort by**: Priority
- **Columns**: Title, Priority, Size, Feature Area, Assignee, Status

#### View 9: Roadmap

- **Name**: 🗺️ Roadmap
- **Type**: Roadmap
- **Group by**: Milestone
- **Sort by**: Target Date
- **Show**: Start Date to Target Date

#### View 10: Current Sprint

- **Name**: 🏃 Current Sprint
- **Type**: Board
- **Filter**: Sprint = Current iteration
- **Group by**: Status
- **Sort by**: Priority

### 5. Add Existing Issues to Project

1. In the project, click **Add item** (+ button)
2. Select **Add items from repository**
3. Search for issues or use filters
4. Select all open issues
5. Click **Add selected items**

Alternatively, use bulk operations:

1. Go to repository Issues tab
2. Select multiple issues using checkboxes
3. Click **Projects** dropdown
4. Select your new project

### 6. Configure Automation Rules

Go to project settings → Workflows and enable these automations:

#### Auto-add to project

- **Trigger**: Item opened
- **Action**: Add to project
- **Applies to**: Issues and Pull Requests

#### Auto-set status based on activity

1. **Trigger**: Item reopened

   - **Action**: Set Status to Todo

2. **Trigger**: Pull request linked to an issue

   - **Action**: Set Status to In Review

3. **Trigger**: Item closed

   - **Action**: Set Status to Done

4. **Trigger**: Item closed as not planned
   - **Action**: Archive item

#### Auto-assign fields

1. **Trigger**: Issue labeled with "bug"

   - **Action**: Set Type to fix
   - **Action**: Set Priority to P1

2. **Trigger**: Issue labeled with "enhancement"

   - **Action**: Set Type to feat
   - **Action**: Set Priority to P2

3. **Trigger**: Issue labeled with "documentation"
   - **Action**: Set Type to docs
   - **Action**: Set Feature Area to Documentation

### 7. Create GitHub Actions Workflow (Automated)

A workflow file will be created at `.github/workflows/project-automation.yml` to handle:

- Auto-labeling based on Type field
- Syncing project fields with issue labels
- Updating project status based on PR events

### 8. Initial Triage

After adding all issues, triage them by:

1. Setting **Type** based on issue content
2. Setting **Priority** (P0-P4)
3. Setting **Size** (XS-XL)
4. Setting **Feature Area**
5. Setting **Milestone** for roadmap planning
6. Setting **Target Date** for important milestones

## Project Maintenance

### Daily

- Move items through Kanban columns as work progresses
- Update blocked items with blockers noted

### Weekly

- Review Bug Tracker view
- Update roadmap dates
- Plan next sprint items

### Sprint Boundaries

- Close completed sprint
- Create new sprint
- Assign items to new sprint

## Labels to Create

Create these labels in your repository to complement the project:

- `bug` - Bug report
- `enhancement` - Feature request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `blocked` - Blocked by dependencies
- `breaking change` - Breaking API changes
- `needs triage` - Needs initial review

## Useful Views for Common Tasks

- **What to work on next?** → Current Sprint view
- **What's blocking us?** → Kanban Board (Blocked column)
- **When will features ship?** → Roadmap view
- **Critical bugs?** → Bug Tracker view (filter Priority = P0)
- **Sprint planning?** → Group by Size, filter by Backlog

## Resources

- [GitHub Projects Documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [Project Automation](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project)
- [GraphQL API for Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects)
