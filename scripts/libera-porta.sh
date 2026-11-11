#!/bin/sh
# Prima di `npm run dev`: chiude il processo Node rimasto in ascolto sulla porta
# dell'app (es. un vecchio `next dev`), così l'app parte sempre su localhost:3000.
# Tocca solo chi è in ascolto su quella porta ed è un processo Node/Next.
PORTA="${1:-3000}"

# -a: tutte le condizioni devono valere insieme (senza, lsof le unisce in OR).
for PID in $(lsof -a -nP -tiTCP:"$PORTA" -sTCP:LISTEN 2>/dev/null); do
  COMANDO=$(ps -o comm= -p "$PID" 2>/dev/null)
  case "$COMANDO" in
    *node* | *next-server*)
      echo "Porta $PORTA occupata da $COMANDO (PID $PID): lo chiudo."
      kill "$PID" 2>/dev/null
      ;;
    *)
      echo "Porta $PORTA occupata da \"$COMANDO\" (PID $PID), non è un processo Node: chiudilo a mano." >&2
      exit 1
      ;;
  esac
done

# Attende che la porta si liberi (max ~5 secondi).
i=0
while [ $i -lt 10 ] && lsof -a -nP -tiTCP:"$PORTA" -sTCP:LISTEN >/dev/null 2>&1; do
  sleep 0.5
  i=$((i + 1))
done
exit 0
