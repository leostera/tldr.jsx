#!/bin/bash -e

readonly FILES=$(find src -name "*.js" | sort)
readonly FILE_COUNT=$(echo "${FILES}" | sed 's/ /\n/g' | wc -l)

echo ${FILE_COUNT}
TOTAL_PERCENTAGE=0.0
for file in ${FILES}; do
  COVERAGE=$(./node_modules/.bin/flow coverage ${file})
  PERCENTAGE=$(echo "${COVERAGE}" | awk -F': ' '{ print $2}' | awk -F'% ' '{ print $1}') 
  TOTAL_PERCENTAGE="$(echo "${PERCENTAGE} + ${TOTAL_PERCENTAGE}" | bc)"
  echo "${file} - ${COVERAGE}"
done

readonly TOTAL="$( echo "${TOTAL_PERCENTAGE}/${FILE_COUNT}.0" | bc)"
echo "Total: ${TOTAL}%"
