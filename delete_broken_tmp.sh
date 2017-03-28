#! /bin/bash
scriptPath=`dirname $0`
cd $scriptPath
for i in uploaded/*.tmp
do
  echo "$i"
  targetTimeString=`stat -c %y "$i" | cut -d ' ' -f -2 | cut -d '.' -f 1 | cut -d ':' -f -2`
  targetYear=`echo "$targetTimeString" | cut -d '-' -f 1`
  targetMonth=`echo "$targetTimeString" | cut -d '-' -f 2`
  targetDay=`echo "$targetTimeString" | cut -d '-' -f 3 | cut -d ' ' -f 1`
  targetHour=`echo "$targetTimeString" | cut -d ' ' -f 2 | cut -d ':' -f 1`
  targetMinute=`echo "$targetTimeString" | cut -d ' ' -f 2 | cut -d : -f 2`
  targetUnits=`expr "$targetYear" \* 525600 + "$targetMonth" \* 43200 + "$targetDay" \* 1440 + "$targetHour" \* 60 + "$targetMinute"`
  currentYear=`date +%Y`
  currentMonth=`date +%m`
  currentDay=`date +%d`
  currentHour=`date +%H`
  currentMinute=`date +%M`
  currentUnits=`expr "$currentYear" \* 525600 + "$currentMonth" \* 43200 + "$currentDay" \* 1440 + "$currentHour" \* 60 + "$currentMinute"`
  age=`expr $currentUnits - $targetUnits`
  if [[ $age -gt 60  ]]
  then
    rm "$i"
  fi
done
