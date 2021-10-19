package edu.stanford.vis.color;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.PrintWriter;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.zip.GZIPInputStream;

import edu.stanford.vis.io.format.CSVFormat;
import edu.stanford.vis.table.DataTable;


public class XKCDResponses {

	// PHASE 1
	// strip: " ","_",".","'","\"","-","/","?","\\"
	// compute 0.05% error line (output error metrics file)
	// reduce data set
	// output final term x count matrix
	
	// PHASE 2
	// analyze count matrix
	// compute "central" colors for terms
	// compute term-term association strengths
	// output JSON model data
	
	public static final String DIR = "../data/xkcd/";
	public static final String FILE = DIR+"xkcd.csv.gz";
	public static final double SPAN = Util.SPAN;
	public static final double PTHRESH = 0.05;
	
	// Manual rewrite to correct identified misspellings
	private static final Map<String,String> REWRITE = new HashMap<String,String>();
	static {
		REWRITE.put("fuscia", "fuchsia");
		REWRITE.put("fuschia", "fuchsia");
		REWRITE.put("fushia", "fuchsia");
		REWRITE.put("bluegray", "bluegrey");
		REWRITE.put("graygreen", "greygreen");
		REWRITE.put("grayblue", "greyblue");
		REWRITE.put("greyishblue", "greyblue");
		REWRITE.put("turqoise", "turquoise");
		REWRITE.put("lavendar", "lavender");
		REWRITE.put("seafoam", "seafoamgreen");
		REWRITE.put("pukegreen", "puke");
		REWRITE.put("navy", "navyblue");
		REWRITE.put("olivegreen", "olive");
		REWRITE.put("reddishbrown", "redbrown");
		REWRITE.put("bluishpurple", "bluepurple");
		REWRITE.put("greenishyellow", "greenyellow");
		REWRITE.put("pinkishpurple", "pinkpurple");
		REWRITE.put("pinkishred", "pinkred");
		REWRITE.put("purplishblue", "purpleblue");
		REWRITE.put("yellowishgreen", "yellowgreen");
		REWRITE.put("mintgreen", "mint");
		REWRITE.put("gray", "grey");
		REWRITE.put("lightgray", "lightgrey");
		REWRITE.put("darkgray", "darkgrey");
	}
	
	public static void main(String[] argv) {
		long t0 = System.currentTimeMillis();
		tally();
		analyze();
		float t = (System.currentTimeMillis() - t0) / 1000f;
		System.out.println("RUNNING TIME: " + t + "sec");
	}
	
	public static void tally()
	{
		// load data table
		System.out.print("Reading Data... ");
		CSVFormat csv = CSVFormat.instance();
		DataTable dt = null;
		try {
			InputStream is = new GZIPInputStream(new FileInputStream(FILE));
			dt = csv.read(is)[0];
		} catch (Exception e) {
			e.printStackTrace();
			return;
		}
		System.out.println(dt.getRowCount() + " responses");
		
		dt.addColumn("tnum", int.class); int TNUM = 4;
		dt.addColumn("cnum", int.class); int CNUM = 5;
		
		Map<String,Integer> tidx = new HashMap<String,Integer>();
		Map<String,Integer> cidx = new HashMap<String,Integer>();
		int tid = 0, cid = 0;
		
		List<String> terms = new ArrayList<String>();
		List<String> colors = new ArrayList<String>();
		
		System.out.print("Indexing Data... ");
		Pattern pat = Pattern.compile("[^a-zA-Z]+");
		for (int i=0; i<dt.getRowCount(); ++i) {			
			// get color chip
			LAB x = LAB.fromRGBr(dt.getInt(i,0),
				dt.getInt(i,1), dt.getInt(i,2), SPAN);
			String c = x.toString();
			
			// index the color chip
			Integer id = cidx.get(c);
			if (id == null) {
				cidx.put(c, id = cid++);
				colors.add(c);
			}
			dt.setInt(i, CNUM, id);
			
			// get color term
			String t = dt.getString(i, 3).toLowerCase();
			t = pat.matcher(t).replaceAll("");
			String r = REWRITE.get(t); if (r != null) t = r;
			if (t.length() == 0) continue;
			
			// index the color term
			id = tidx.get(t);
			if (id == null) {
				tidx.put(t, id = tid++);
				terms.add(t);
			}
			dt.setInt(i, TNUM, id);
		}
		long C = colors.size(), W = terms.size();
		System.out.println(C+" colors, "+W+" terms");
		
		// build color x term count matrix
		System.out.println("Tallying Data");
		Map<Long,Integer> T = new HashMap<Long,Integer>();
		for (int i=0; i<dt.getRowCount(); ++i) {
			int c = dt.getInt(i, CNUM), w = dt.getInt(i, TNUM);
			if (c < 0 || w < 0) continue;
			long idx = c*W + w;
			Integer cnt = T.get(idx);
			T.put(idx, cnt==null ? 1 : cnt+1);
		}
		
		// compute column sum of squares
		long Sc[] = new long[(int)W];
		for (Map.Entry<Long, Integer> ent : T.entrySet()) {
			long idx = ent.getKey();
			int w = (int)(idx % W);
			int k = ent.getValue();
			Sc[w] += ((long)k)*k;
		}
		
		// sort words by increasing frequency
		System.out.print("Finding Threshold... ");
		int threshold = -1;
		int ss[] = Util.sortindices(Sc);
		if (threshold < 0) {
			double norm = 0, max = 0;
			
			for (Map.Entry<Long, Integer> ent : T.entrySet()) {
				max += ent.getValue() * ent.getValue();
			}
			max = Math.sqrt(max);
			
			// compute Frobenius norm difference over decreasing values
			for (int i=0; i<W; ++i) {
				int w = ss[i];
				double diff = 0, root;
				for (int c=0; c<C; ++c) {
					Integer count = T.get(c*W+w);
					if (count != null) diff += count*count;
				}
				norm += diff;
				root = Math.sqrt(norm);
				
				if (threshold < 0 && root/max >= PTHRESH) {
					threshold = i;
					break;
				}
			}
		}
		System.out.println(threshold+" ("+(W-threshold)+")");
		
		// recompute terms
		System.out.println("Reindexing Terms");
		List<String> nterms = new ArrayList<String>();
		int[] lut = new int[(int)W];
		for (int i=0; i<W; ++i) lut[i] = -1;
		for (int i=ss.length, k=0; --i >= threshold; ++k) {
			nterms.add(terms.get(ss[i]));
			lut[ss[i]] = k;
		}
		
		// recompute tallies
		System.out.println("Recomputing Tally");
		T = new HashMap<Long,Integer>();
		long K = nterms.size();
		for (int i=0; i<dt.getRowCount(); ++i) {
			int c = dt.getInt(i, CNUM),
			    w = dt.getInt(i, TNUM);
			if (c < 0 || w < 0 || lut[w] < 0) continue;
			long idx = c*K + lut[w];
			Integer cnt = T.get(idx);
			T.put(idx, cnt==null ? 1 : cnt+1);
		}
		
		System.out.println("Smoothing Data");
		Util.Grid g = Util.grid(colors, (int)Util.SPAN);
		T = Util.smooth(g, T, nterms.size());
		
		// threshold tally matrix
		System.out.println("Thresholding Data");
		int mincount = 1;
		if (mincount > 0) {
			Iterator<Map.Entry<Long, Integer>> iter = T.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry<Long, Integer> ent = iter.next();
				if (ent.getValue() <= mincount) {
					iter.remove();
				}
			}
		}
		
		// write data
		System.out.println("Writing Results");
		Util.writeList(DIR+"colors.txt", colors);
		Util.writeList(DIR+"terms.txt", nterms);
		Util.writeMap(DIR+"tally.txt", T);
	}
	
	public static void analyze() {
		System.out.print("Loading Data... ");
		List<String> terms = Util.readList(DIR+"terms.txt");
		List<String> colors = Util.readList(DIR+"colors.txt");
		Map<Long,Integer> T = Util.readMap(DIR+"tally.txt");
		long C = colors.size(), W = terms.size();
		System.out.println(C+" colors, "+W+" terms");
		
		// compute row and column sums
		int Sw[] = new int[(int)C];
		int Sc[] = new int[(int)W];
		for (Map.Entry<Long, Integer> ent : T.entrySet()) {
			long idx = ent.getKey();
			int c = (int)(idx / W);
			int w = (int)(idx % W);
			int k = ent.getValue();
			Sw[c] += k;
			Sc[w] += k;
		}
		
		// build term association matrix
		System.out.print("Computing Term Probabilities... ");
		double A[] = new double[(int)(W*W)];
		for (int w=0; w<W; ++w) {
			for (int v=0; v<W; ++v) {
				for (int c=0; c<C; ++c) {
					long cc = c*W;
					double a = 0, b = 0;
					Integer count;
					if (Sw[c] != 0 && (count = T.get(cc+w)) != null)
						a = ((double)count) / Sw[c];
					if (a != 0 && Sc[v] != 0 && (count = T.get(cc+v)) != null)
						b = ((double)count) / Sc[v];
				    A[(int)(v*W+w)] += a*b;
				}
			}
		}
		System.out.println(W+" x "+W);
		
		// save results to disk
		System.out.println("Writing Results");
		print(colors, terms, T, Sw, Sc, A);
		
		// XXX TEMP DEBUG
		// print top color term associations
		System.out.println("Top Color Term Associations");
		for (int w=0; w<W; ++w) {
			int ww = w*(int)W, idx = -1;
			double max = 0;
			for (int i=0; i<W; ++i) {
				if (i==w) continue;
				double val = A[ww+i];
				if (val > max) {
					max = val;
					idx = i;
				}
			}
			System.out.println(terms.get(w) + "\t" + terms.get(idx) + "\t" + max);
		}
	}
	
	public static void print(List<String> colors, List<String> terms,
		Map<Long,Integer> T, int[] ccount, int[] tcount, double[] A)
	{
		try {
			int C = colors.size();
			int W = terms.size();
			
			NumberFormat fmt = DecimalFormat.getNumberInstance();
			fmt.setGroupingUsed(false);
			fmt.setMinimumFractionDigits(0);
			fmt.setMaximumFractionDigits(5);
			
			PrintWriter pw = new PrintWriter(new FileWriter(DIR+"c3_data.json"));
			pw.print("{");
			
			pw.print("\"color\":[");
			for (int i=0; i<C; ++i) {
				if (i > 0) pw.print(",");
				String c = colors.get(i);
				pw.print(c);
			}
			pw.print("]");
			
			pw.print(",\"terms\":[");
			for (int i=0; i<W; ++i) {
				if (i > 0) pw.print(",");
				String t = terms.get(i);
				pw.print("\""+t+"\"");
			}
			pw.print("]");
			
			pw.print(",\"T\":[");
			for (int c=0, k=0; c<C; ++c) {
				long cc = c*W;
				for (int w=0; w<W; ++w) {
					Integer cnt = T.get(cc+w);
					if (cnt != null) {
						if (k++ > 0) pw.print(",");
						pw.print((cc+w)+","+cnt);
					}
				}
			}
			pw.print("]");
			
			pw.print(",\"A\":[");
			for (int w=0, i=0; w<W; ++w) {
				for (int v=0; v<W; ++v) {
					if (v > 0 || w > 0) pw.print(",");
					double x = A[i++];
					String s = x==0 ? "0" : fmt.format(x);
					pw.print(s);
				}
			}
			pw.print("]");
			
			pw.println("}");
			pw.close();
			
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	

}