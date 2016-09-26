'''Scrip para generar 2 graficos por franjaetaria de los bienes y
deudas de los funcionarios. Baja los datos de la api de gobiernoabierto
de cordoba.
'''
import requests
import json
import pandas as pd
from pandas.io.json import json_normalize
import numpy as np
from bokeh.plotting import output_file, show
from bokeh.models import NumeralTickFormatter
from bokeh.charts import Bar
from bokeh.layouts import gridplot

print("Bajando los datos de los funcionarios...")
url_requests = 'https://gobiernoabierto.cordoba.gob.ar/api/ddjj/'
s = requests.get(url_requests)
chunks = []
chunks.append(json.loads(s.text)['results'])
while json.loads(s.text)['next'] != None:
    s = requests.get(url_requests)
    chunks.append(json.loads(s.text)['results'])
    url_requests = (json.loads(s.text)['next'])

print("Trabajando los datos...")
datos = json_normalize(chunks[0])
for i in range(1, len(chunks)):
    otros_datos = json_normalize(chunks[i])
    datos = datos.append(otros_datos, ignore_index=True)

deuda = []
for deudor in datos.deudas[:]:
    if not len(deudor):
        deuda.append(0)
    else:
        deuda.append(float(deudor[0]['valor']))
datos['deudas.cant'] = pd.Series(deuda)

bienes = []
for bienor in datos.bienes[:]:
    if not len(bienor):
        bienes.append(0)
    else:
        suma = 0
        for item in bienor:
            suma += float(item['valor'])
        bienes.append(float(suma))
datos['bienes.cant'] = pd.Series(bienes)
datos.drop(['anio', 'archivo', 'bienes', 'deudas', 'persona.apellido',
            'persona.edad', 'persona.foto.original', 'persona.foto.thumbnail',
            'persona.foto.thumbnail_32x32', 'persona.nombre',
            'persona.genero', 'persona.uniqueid', 'persona.url'],
           axis=1, inplace=True)
datos.drop_duplicates(inplace=True)

franjaetaria = datos['persona.franjaetaria'].unique().tolist()
franjaetaria.remove(None)
franjaetaria.sort()
bienes_por_franjaetaria = []
deuda_por_franjaetaria = []
for franja in franjaetaria:
    deuda_franja = datos.loc[datos['persona.franjaetaria'] ==\
                             franja]['deudas.cant'].mean()
    bienes_franja = datos.loc[datos['persona.franjaetaria'] ==\
                              franja]['bienes.cant'].mean()
    deuda_por_franjaetaria.append(deuda_franja)
    bienes_por_franjaetaria.append(bienes_franja)

print("Graficando los datos...")
p1 = Bar(data={'deuda': deuda_por_franjaetaria, 'franja': franjaetaria}, label='franja', values='deuda', title="Promedio de deudas (AR$) por franja etaria")
p2 = Bar(data={'franja': franjaetaria, 'bienes': bienes_por_franjaetaria}, label='franja', values='bienes', title="Promedio de bienes (AR$) por franja etaria", color='blue')
p1.yaxis[0].formatter = NumeralTickFormatter(format="$0,0.0")
p2.yaxis[0].formatter = NumeralTickFormatter(format="$0,0.0")
output_file("../bienes_y_deudas_por_franja_etaria.html")
show(gridplot([[p1,p2]]))
print("Todo terminado!! La salida, una carpeta atras con el nombre ",
"bienes_y_deudas_por_franja_etaria.html")