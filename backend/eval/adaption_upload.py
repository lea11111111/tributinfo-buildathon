"""Sube las semillas a Adaption y estima el costo del run de variantes.

Uso (desde backend/):
  python eval/adaption_upload.py            # sube y estima, NO consume creditos
  python eval/adaption_upload.py --run      # lanza el run de verdad

Requiere ADAPTION_API_KEY en backend/.env o como variable de entorno.
La instruccion de variantes (universal prompt) se escribe en la web app:
ver eval/README.md.
"""
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def cargar_env() -> None:
    env = HERE.parent / ".env"
    if not env.exists():
        return
    for linea in env.read_text(encoding="utf-8-sig").splitlines():
        linea = linea.strip()
        if linea and not linea.startswith("#") and "=" in linea:
            clave, _, valor = linea.partition("=")
            os.environ.setdefault(clave.strip(), valor.strip())


def main() -> None:
    cargar_env()
    if not os.environ.get("ADAPTION_API_KEY"):
        sys.exit("Falta ADAPTION_API_KEY (backend/.env)")

    from adaption import Adaption

    client = Adaption()

    semillas = HERE / "semillas.jsonl"
    resultado = client.datasets.upload_file(str(semillas))
    print(f"Dataset subido: {resultado.dataset_id}")

    lanzar = "--run" in sys.argv
    run = client.datasets.run(
        resultado.dataset_id,
        column_mapping={
            "prompt": "pregunta",
            "completion": "respuesta_correcta",
        },
        estimate=not lanzar,
    )

    if lanzar:
        print(f"Run lanzado: {run.run_id}")
        estado = client.datasets.wait_for_completion(resultado.dataset_id)
        print(f"Estado final: {estado.status}")
        url = client.datasets.download(resultado.dataset_id)
        print(f"Descarga: {url}")
    else:
        print(f"Creditos estimados: {run.estimated_credits_consumed}")
        print("Preview solamente — no se consumieron creditos.")
        print("Para las VARIANTES conviene el wizard de la web app (universal")
        print("prompt con la instruccion de eval/README.md) usando este dataset.")


if __name__ == "__main__":
    main()
