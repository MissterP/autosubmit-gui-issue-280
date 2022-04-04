# Autosubmit GUI

[![status](https://joss.theoj.org/papers/a8ac17f6c02fdf76098ac97ed3e09b22/status.svg)](https://joss.theoj.org/papers/a8ac17f6c02fdf76098ac97ed3e09b22)

# Table of Contents

1. [Overview](#Overview)
2. [Autosubmit Big Picture](#autosubmit-big-picture)
3. [General Knowledge Requirements](#general-knowledge-requirements)
4. [Installation](#installation)
5. [Testing](#testing)
6. [User Guide](#user-guide)
7. [Contributing](#contributing)
8. [Common Problems](#common-problems)

## Overview:

**Autosubmit GUI** is a front-end software developed using [ReactJS](https://reactjs.org/docs/getting-started.html) as the main framework, and JavaScript in general. This front-end software consumes most of the information it needs from [Autosubmit API](https://earth.bsc.es/gitlab/es/autosubmit_api), an API that retrieves information from an internal file system and databases that result from the execution experiments under [Autosubmit](https://earth.bsc.es/gitlab/es/autosubmit) on a High Performance Computing environment.

These two systems, the **API** and the **GUI**, are independent. It is possible to replace **Autosubmit API** for another API that provides similar information. For that purpose, we provide with response examples (more details in the installation section) that can help the developer understand how the information is used in the components of the GUI. Furthermore, you can find the current list of available requests in the [Autosubmit API Wiki](https://earth.bsc.es/gitlab/es/autosubmit_api/-/wikis/home).

**Autosubmit GUI** uses [FancyTree](https://github.com/mar10/fancytree/), [vis.js](https://visjs.org/), and [d3js](https://d3js.org/); these are popular and very useful libraries that help us show the experiment information in a graphical and comprehensive way. The **GUI** implements creative ways to use these libraries to dynamically display information without losing performance. Some of the expermients in our environment can include more than `10000` jobs, and showing this information in a web format without significant loss of performance is by itself an achievement.

## Autosubmit Big Picture

![Autosubmit Big Picture](/docs/Total_Autosubmit_Diagram.png)

In this image you can see the flow of information in the **Autosubmit environment**.

* **Autosubmit**: Machines running Autosubmit.
* **Remote Platforms**: Platforms (HPCs in most cases) to which Autosubmit connects to run jobs. 
* **Experiment Database**: Starting from Autosubmit `3.13.0`, each experiment generates a set of databases that save important (reusable) information about it. We have the `historical database`, `graph database`, `structures database`.
* **File System**: The file system where the experiment files are stored.
* **Data Process Workers**: **Autosubmit API** implements a set of workers that periodically collect information from the experiments or complement that information. In the current **BSC** implementation, these workers are running no `bscesweb04` under `webadmin` user.
* **Main Database**: **Autosubmit API** uses a centralized database to keep track of important experiment information. The **workers** fill this information. **Autosubmit** also writes into this database.
* **Autosubmit API**: See [Autosubmit API](https://earth.bsc.es/gitlab/es/autosubmit_api). Currently, under **BSC** implementation, this API is running on `bscesweb04` under `webadmin` user. This API exposes a set of requests that **Autosubmit GUI** consumes and serves to the users through the front end.
* **Autosubmit GUI**: This project.
* **Authentication Server**: **BSC Central Authentication Service**.
* **Users**: Users that access the GUI through their web browsers from any device. The current implementation requires that an user generates a token using the Authentication server once every 5 days.

## General Knowledge Requirements:

- npm
- Javascript: asynchronous functions, promises, event handling, etc.
- Bootstrap 4 and CSS
- DOM manipulation
- JSON
- ReactJS

## Installation

The main development framework is **npm**, we are currently using version `6.9.0`. You can find the main **npm** dependencies in the file: [package.json](package.json).
Refer to: [npm documentation](https://docs.npmjs.com/) for more information about installation and first steps on this platform.

Make sure to have npm installed in your local environment.

Execute:

`git clone https://earth.bsc.es/gitlab/es/autosubmitreact/`

As default, the GUI will request data from the `Autosubmit API`, which is inacessible from outside the Barcelona Supercomputing Center internal network.
So, we should open the file:

`/autosubmitreact/src/components/context/vars.js`

And change the lines:

`export const NOAPI = false;`

`export const AUTHENTICATION = true;`

to:

`export const NOAPI = true;`

`export const AUTHENTICATION = false;`

This will effectively set the API calls to be redirected towards an internal data samples folder `/autosubmitreact/src/components/context/data/` implemented for testing purposes.

**IMPORTANT**: The static data required by `NOAPI = true` is stored in [/autosubmitreact/data](https://earth.bsc.es/gitlab/es/autosubmitreact/-/tree/master/data) because we don't want that the package sent for deployment includes all this information that will only increase the size of the package. Therefore, in forder for `NOAPI = true` to work, you should copy the contents of `/autosubmitreact/data/` into `/autosubmitreact/src/components/context/data/`.

In the case of `AUTHENTICATION`, you set it to `false` to avoid the requirement of an authentication token, because you won't be able to get one from BSC internal Central Authentication Service.
However, some API calls might require that you have a valid token, but if you are using the internal data, it shouldn't be a problem.

Then, you can run:

`npm install`

And all the necessary dependencies will be installed.

After that, you will be able to run:

`npm start`

Then, the GUI should open in your default browser, and the information displayed should correspond to that of the data samples folder.

## Testing

The testing suite has been developed using [JEST](https://jestjs.io/en/).

To execute it, go to your main folder (`/autosubmitreact/`) and execute:

`npm test`

Almost all tests can be found at `/autosubmitreact/src/components/experiment/tests/`.

Make sure that you have installed the dependencies before running the tests.

Note: It could happen that `jest` fails to run or is not automatically installed along the other dependencies on a Windows machine, please install it manually.


## User Guide

A user guide has been developed and published at [https://autosubmit.readthedocs.io/en/latest/autosubmit-gui.html](https://autosubmit.readthedocs.io/en/latest/autosubmit-gui.html).
Although a little outdated, we are constantly working on updating it considering the latest features.

## Contributing

Currently, the development of this software is under the `Autosubmit team` that belongs to the `Earth Science Department` of the `Barcelona Supercomputing Center`.

You can open issues in this repository using the `Email a new issue to this project` function, since user creation is currently restricted to only `BSC` members.
Most issues have been centralized in the [Autosubmit repository](https://earth.bsc.es/gitlab/es/autosubmit/-/issues), and you can check them there.

You are free (and encouraged) to clone this software and modify it to fit your needs. Moreover, the `BSC` is always looking for collaboration, so feel free to request support.

## Common Problems

Although a clean install using `npm install` should work without problems, some issues might arise according to your local settings. Here is a list of common problems:

- Deprecated vis.js https://earth.bsc.es/gitlab/es/autosubmitreact/-/issues/5#note_163057: A permanent solution will required updating our `vis.js` dependency. We will test it; meanwhile, you can ignore this warning.
- Problems with chokidar package https://earth.bsc.es/gitlab/es/autosubmitreact/-/issues/5#note_163109: Delete `node_modules` folder, run `npm install` and then `npm install chokidar`.
