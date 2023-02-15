#!/bin/bash

#(cd ./.generate && setsid npm run start);
# source ~/.bashrc;
# xdotool windowminimize $(xdotool getactivewindow)
# xdotool getactivewindow windowminimize;
# echo -ne '\e[2t';
(cd ./.generate && setsid npm run start > /dev/null &)
sleep 0.01s;
# exit;

