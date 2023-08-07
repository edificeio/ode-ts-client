#!/usr/bin/env groovy

pipeline {
  agent any
  stages {
    stage('Init') {
      steps {
        checkout scm
        sh './build.sh clean init'
      }
    }
    stage('Build') {
      steps {
        sh "./build.sh build"
      }
    }
    /* stage('Archive') {
      steps {
        sh './build.sh archive'
      }
    } */
    stage('Publish NPM') {
      steps {
        configFileProvider([configFile(fileId: '.npmrc-infra-front', variable: 'NPMRC')]) {
          sh "cp $NPMRC .npmrc"
          sh "./build.sh publishNPM"
        }
      }
    }
    stage('Publish Nexus') {
      steps {
        sh './build.sh publishNexus'
      }
    }
  }
}

