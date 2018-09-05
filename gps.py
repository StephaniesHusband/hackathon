import Adafruit_BBIO.UART as UART
import serial
import time
import sys

import Adafruit_DHT as DHT

UART.setup("UART2")

# Note this is an O not a zero!!!!!
ser = serial.Serial(port = "/dev/ttyO2", baudrate=9600)
ser.flush()

class GPS:
    #The GPS module used is a Grove GPS module http://www.seeedstudio.com/depot/Grove-GPS-p-959.html
    inp=[]
    # Refer to SIM28 NMEA spec file http://www.seeedstudio.com/wiki/images/a/a0/SIM28_DATA_File.zip
    GGA=[]

    #Read data from the GPS
    def read(self):    
        while True:
            GPS.inp=ser.readline()
            if GPS.inp[:6] =='$GPGGA': # GGA data , packet 1, has all the data we need
                break
            time.sleep(0.1)
        try:
            ind=GPS.inp.index('$GPGGA',5,len(GPS.inp))    #Sometimes multiple GPS data packets come into the stream. Take the data only after the last '$GPGGA' is seen
            GPS.inp=GPS.inp[ind:]
        except ValueError:
            print ""
        GPS.GGA=GPS.inp.split(",")    #Split the stream into individual parts
        return [GPS.GGA]
        
    #Split the data into individual elements
    def vals(self):
        time=GPS.GGA[1]
        lat=GPS.GGA[2]
        lat_ns=GPS.GGA[3]
        lng=GPS.GGA[4]
        lng_ew=GPS.GGA[5]
        fix=GPS.GGA[6]
        sats=GPS.GGA[7]
        alt=GPS.GGA[9]
        return [time,fix,sats,alt,lat,lat_ns,lng,lng_ew]

g=GPS()

ind=0
while True:
    try:
        x=g.read()    #Read from GPS
        
        print g.vals();
        
        [t,fix,sats,alt,lat,lat_ns,lng,lng_ew]=g.vals()    #Get the individial values
        if alt=="": alt=5
        if fix=="0": fix=6   #this is interpretted as # of sats to SA
        if lat=="": lat=3503.6317     #default
        if lng=="": lng=8972.0605     #default
        if lat_ns=="": lat_ns=""     #default
        if lng_ew=="": lng_ew="W"     #default
       
        lat=str(float(lat)/100) 
        lng=str(float(lng)/100) 
        
        print "Alt:",alt,"Lat:",lat,"NS:",lat_ns,"Lng:",lng,"EW:",lng_ew,"#Sats:",fix,
        s=str(alt)+","+str(lat)+","+str(lat_ns)+","+str(lng)+","+str(lng_ew)+","+str(fix)+"\n"
        
        f=open("gps_data.csv", 'w')    #Open file to log the data
        f.write(s)    #Save stats to file
        f.close()
        
        time.sleep(2)    #Read every 2 seconds
    except IndexError:
        print "Unable to read"
    except KeyboardInterrupt:
        print "Exiting"
        sys.exit(0)