#!/bin/bash

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <clean|init|build|install|watch>"
  echo "Example: $0 clean"
  echo "Example: $0 init"
  echo "Example: $0 build"
  echo "Example: $0 install"
  echo "Example: $0 [--springboard=recette] watch"
  exit 1
fi

MVN_MOD_GROUPID=`grep 'modowner=' gradle.properties | sed 's/modowner=//'`
MVN_MOD_NAME=`grep 'modname=' gradle.properties | sed 's/modname=//'`
MVN_MOD_VERSION=`grep 'version=' gradle.properties | sed 's/version=//'`

if [ ! -e node_modules ]
then
  mkdir node_modules
fi

if [ -z ${USER_UID:+x} ]
then
  export USER_UID=1000
  export GROUP_GID=1000
fi

if [ -e "?/.gradle" ] && [ ! -e "?/.gradle/gradle.properties" ]
then
  echo "odeUsername=$NEXUS_ODE_USERNAME" > "?/.gradle/gradle.properties"
  echo "odePassword=$NEXUS_ODE_PASSWORD" >> "?/.gradle/gradle.properties"
  echo "sonatypeUsername=$NEXUS_SONATYPE_USERNAME" >> "?/.gradle/gradle.properties"
  echo "sonatypePassword=$NEXUS_SONATYPE_PASSWORD" >> "?/.gradle/gradle.properties"
fi

# options
SPRINGBOARD=""
for i in "$@"
do
case $i in
    -s=*|--springboard=*)
    SPRINGBOARD="${i#*=}"
    shift
    ;;
    *)
    ;;
esac
done

clean () {
  rm -rf node_modules dist test .husky .gradle package.json yarn.lock deployment
}

init () {
  echo "[init] Get branch name from jenkins env..."
  BRANCH_NAME=`echo $GIT_BRANCH | sed -e "s|origin/||g"`
  if [ "$BRANCH_NAME" = "" ]; then
    echo "[init] Get branch name from git..."
    BRANCH_NAME=`git branch | sed -n -e "s/^\* \(.*\)/\1/p"`
  fi

  echo "[init] Generate deployment file from conf.deployment..."
  mkdir -p deployment/$MVN_MOD_NAME
  cp conf.deployment deployment/$MVN_MOD_NAME/conf.json.template
  sed -i "s/%MODNAME%/${MVN_MOD_NAME}/" deployment/$MVN_MOD_NAME/conf.json.template
  sed -i "s/%VERSION%/${MVN_MOD_VERSION}/" deployment/$MVN_MOD_NAME/conf.json.template

  echo "[init] Generate package.json from package.json.template..."
  NPM_VERSION_SUFFIX=`date +"%Y%m%d%H%M"`
  cp package.json.template package.json
  sed -i "s/%generateVersion%/${NPM_VERSION_SUFFIX}/" package.json

  PRECOMMIT_CMD="docker-compose run --rm -u \\\"$USER_UID:$GROUP_GID\\\" node sh -c \\\"yarn test && yarn docs\\\" && git add ./docs/*"
  docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "yarn install && yarn prepare && npx husky add .husky/pre-commit \"$PRECOMMIT_CMD\"" # && git add .husky/pre-commit"
}

tests () {
  docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "yarn test"
}

build () {
  docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "yarn build"
  status=$?
  if [ $status != 0 ];
  then
    exit $status
  fi

  VERSION=`grep "version="  gradle.properties| sed 's/version=//g'`
  echo "ode-ts-client=$VERSION `date +'%d/%m/%Y %H:%M:%S'`" >> dist/version.txt
}

watch () {
  if [ -z $SPRINGBOARD ]; then
    echo "Watching => ./dist folder"
    docker-compose run \
      --rm \
      -u "$USER_UID:$GROUP_GID" \
      node sh -c "yarn watch --build_target=dist"
  else
    echo "Watching => $SPRINGBOARD springboard"
    docker-compose run \
      --rm \
      -u "$USER_UID:$GROUP_GID" \
      -v $PWD/../$SPRINGBOARD:/home/node/springboard \
      node sh -c "yarn watch --build_target=/home/node/springboard/assets/js/ode-ts-client"
  fi
}

audit () {
  docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "yarn audit"
}

doc () {
  docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "yarn docs"
}

publishNPM () {
  LOCAL_BRANCH=`echo $GIT_BRANCH | sed -e "s|origin/||g"`
  docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "yarn publish --tag $LOCAL_BRANCH"
}

archive() {
  echo "[archive] Archiving dist folder and conf.j2 file..."
  tar cfzh ${MVN_MOD_NAME}.tar.gz dist/* ode-ts-client/conf.j2
}

publishNexus () {
  case "$MVN_MOD_VERSION" in
    *SNAPSHOT) nexusRepository='snapshots' ;;
    *)         nexusRepository='releases' ;;
  esac
  mvn deploy:deploy-file \
    --batch-mode \
    -DgroupId=$MVN_MOD_GROUPID \
    -DartifactId=$MVN_MOD_NAME \
    -Dversion=$MVN_MOD_VERSION \
    -Dpackaging=tar.gz \
    -Dfile=${MVN_MOD_NAME}.tar.gz \
    -DrepositoryId=wse \
    -Durl=https://maven.opendigitaleducation.com/nexus/content/repositories/$nexusRepository/
}

publishMavenLocal(){
  mvn install:install-file \
    --batch-mode \
    -DgroupId=$MVN_MOD_GROUPID \
    -DartifactId=$MVN_MOD_NAME \
    -Dversion=$MVN_MOD_VERSION \
    -Dpackaging=tar.gz \
    -Dfile=${MVN_MOD_NAME}.tar.gz
}

for param in "$@"
do
  case $param in
    clean)
      clean
      ;;
    init)
      init
      ;;
    build)
      build
      ;;
    test)
      tests
      ;;
    watch)
      watch
      ;;
    doc)
      doc
      ;;
    install)
      build && archive && publishMavenLocal && rm -rf build
      ;;
    audit)
      audit
      ;;
    archive)
      archive
      ;;
    publishNPM)
      publishNPM
      ;;
    publishNexus)
      publishNexus
      ;;
    *)
      echo "Invalid argument : $action"
  esac
  if [ ! $? -eq 0 ]; then
    exit 1
  fi
done