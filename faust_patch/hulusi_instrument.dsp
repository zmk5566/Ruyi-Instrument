declare name "Hulusi";
declare description "Hulusi Instrument";
declare author "Zhengyang Kenny Ma (zmaaf@connect.ust.hk)";
declare copyright "Zhengyang Kenny Ma";
declare version "1.0";
declare licence "STK-4.3"; // Synthesis Tool Kit 4.3 (MIT style license);
declare description "based on Romain Michon example of the bottle. customized as a hulusi with a blowing pressure";

import("instruments.lib");
import("stdfaust.lib");
fl = library("filter.lib");

//==================== GUI SPECIFICATION ================

// Replaced freq with midiPitch and added frequency calculation
midiPitch = hslider("h:Basic_Parameters/midiPitch [1][tooltip:MIDI pitch value]", 69, 20, 255, 1); 
tfreq = 440 * pow(2, (midiPitch - 69) / 12); // Calculate frequency from MIDI pitch

gain = nentry("h:Basic_Parameters/gain [1][tooltip:Gain (value between 0 and 1)]",1,0,1,0.01); 
gate = button("h:Basic_Parameters/gate [1][tooltip:noteOn = 1, noteOff = 0]");

noiseGain = hslider("h:Physical_and_Nonlinearity/v:Physical_Parameters/Noise_Gain 
[2][tooltip:Breath noise gain (value between 0 and 1)]",0.5,0,1,0.01)*2;
pressure = hslider("h:Physical_and_Nonlinearity/v:Physical_Parameters/Pressure 
[2][tooltip:Breath pressure (value bewteen 0 and 1)]",1,0.7,1,0.01);


portamento = vslider("[5] Portamento [unit:sec] [style:knob] [scale:log]
      [tooltip: Portamento (frequency-glide) time-constant in seconds]",
      0.1,0.001,10,0.001);
 freq = tfreq : fl.smooth(fl.tau2pole(portamento));



typeModulation = 0;
nonLinearity =0;
frequencyMod = 220;
nonLinAttack = 0.1;

envelopeAttack = hslider("h:Envelopes_and_Vibrato/v:Envelope_Parameters/Envelope_Attack 
[5][unit:s][tooltip:Envelope attack duration]",0.01,0,2,0.01);
envelopeDecay = hslider("h:Envelopes_and_Vibrato/v:Envelope_Parameters/Envelope_Decay 
[5][unit:s][tooltip:Envelope decay duration]",0.01,0,2,0.01);
envelopeRelease = 0.02;


//==================== SIGNAL PROCESSING ================

//----------------------- Nonlinear filter ----------------------------
//nonlinearities are created by the nonlinear passive allpass ladder filter declared in miscfilter.lib

//nonlinear filter order
nlfOrder = 6; 

//attack - sustain - release envelope for nonlinearity (declared in instruments.lib)
envelopeMod = en.asr(nonLinAttack,1,envelopeRelease,gate);

//nonLinearModultor is declared in instruments.lib, it adapts allpassnn from miscfilter.lib 
//for using it with waveguide instruments
NLFM =  nonLinearModulator((nonLinearity : si.smoo),envelopeMod,freq,
typeModulation,(frequencyMod : si.smoo),nlfOrder);

//----------------------- Synthesis parameters computing and functions declaration ----------------------------

//botlle radius
huluRadius = 0.999;

//stereoizer is declared in instruments.lib and implement a stereo spacialisation in function of 
//the frequency period in number of samples 
stereo = stereoizer(ma.SR/freq);

bandPassFilter = bandPass(freq,huluRadius);

//----------------------- Algorithm implementation ----------------------------

//global envelope is of type attack - decay - sustain - release
envelopeG =  gain*en.adsr(gain*envelopeAttack,envelopeDecay,1,envelopeRelease,gate);

//pressure envelope is also ADSR
envelope = pressure*en.adsr(gain*0.02,0.01,1,0.02,gate);

//breat pressure
breathPressure = envelope;

//breath noise
randPressure = noiseGain*no.noise*breathPressure ;

process = 
	//differential pressure
	(-(breathPressure) <: 
	((+(1))*randPressure : +(breathPressure)) - *(jetTable),_ : bandPassFilter,_)~NLFM : !,_ : 
	//signal scaling
	fi.dcblocker*envelopeG*0.5 : stereo : instrReverb;

