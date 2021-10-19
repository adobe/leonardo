package edu.stanford.vis.color;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class Util {

	public static final double SPAN = 5;
		
	public static double gaussian(double x, double sigma) {
		sigma = sigma * sigma;
		return (1.0 / (2 * Math.PI * sigma)) * Math.exp(-x*x / (2* sigma));
	}
	
	// -- GRID ----------------------------------------------------------------
	
	public static class Grid {
		int[][][] grid;
		int[] L;
		int[] a;
		int[] b;
	}
	
	public static Grid grid(List<String> colors, int span) {
		int dL = 100, dA = 220, dB = 220, offL = 0, offA = 110, offB = 110;
		Grid g = new Grid();
		g.L = new int[dL/span+1]; for (int L=0,i=0; L<=dL; L+=span, ++i) g.L[i] = L; 
		g.a = new int[dA/span+1]; for (int a=-110,i=0; a<=dA/2; a+=span, ++i) g.a[i] = a;
		g.b = new int[dB/span+1]; for (int b=-100,i=0; b<=dB/2; b+=span, ++i) g.b[i] = b;
		g.grid = new int[g.L.length][g.a.length][g.b.length];
		for (int L=0; L<g.L.length; ++L)
			for (int a=0; a<g.a.length; ++a)
				for (int b=0; b<g.b.length; ++b)
					g.grid[L][a][b] = -1;
		
		for (int c=0; c<colors.size(); ++c) {
			String tok[] = colors.get(c).split("\\,");
			int L = (offL + Integer.parseInt(tok[0])) / span;
			int a = (offA + Integer.parseInt(tok[1])) / span;
			int b = (offB + Integer.parseInt(tok[2])) / span;
			g.grid[L][a][b] = c;
		}
		
		return g;
	}
	
	public static Map<Long,Integer> smooth(Grid grid, Map<Long,Integer> T, int W) {
		Map<Long,Integer> Ts = new HashMap<Long,Integer>();
		int[][][] g = grid.grid;
		for (int li=0; li<g.length; ++li) {
			int[][] gAB = g[li];
			for (int ai=0; ai<gAB.length; ++ai) {
				int[] gB = gAB[ai];
				for (int bi=0; bi<gB.length; ++bi) {
					if (gB[bi] >= 0) smoothCell(li, ai, bi, grid, T, W, Ts);
				}
			}
		}
		return Ts;
	}
	
	public static void smoothCell(int i, int j, int k, Grid grid,
		Map<Long,Integer> T, int W, Map<Long,Integer> Ts)
	{
		int[][][] g = grid.grid;
		double tally[] = new double[W];
		double weight[] = { 4, 1 }, sum = 0;
		
		for (int ii=-1; ii<2; ++ii) {
			for (int jj=-1; jj<2; ++jj) {
				for (int kk=-1; kk<2; ++kk) {
					int c = -1;
					try {
						c = g[i+ii][j+jj][k+kk];
					} catch (Exception e) { continue; }
					if (c < 0) continue;
					long cc = ((long)c) * W;
					double wgt = weight[ii==0&&jj==0&&kk==0?0:1];
					for (int w=0; w<W; ++w) {
						Integer count = T.get(cc+w);
						if (count == null) continue;
						tally[w] += wgt * count;
					}
					sum += wgt;
				}
			}
		}
		int c = g[i][j][k];
		long cc = ((long)c)*W;
		for (int w=0; w<W; ++w) {
			int val = (int)Math.ceil(tally[w] / sum);
			if (val > 0) Ts.put(cc+w, val);
		}
	}


	// -- INPUT/OUTPUT --------------------------------------------------------
	
	public static void writeList(String file, List<String> list) {
		try {
			PrintWriter out = new PrintWriter(new FileWriter(file));
			for (String s : list) {
				out.println(s);
			}
			out.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public static void writeMap(String file, Map<Long,Integer> map) {
		try {
			PrintWriter out = new PrintWriter(new FileWriter(file));
			for (Map.Entry<Long, Integer> ent : map.entrySet()) {
				out.println(ent.getKey() + "\t" + ent.getValue());
			}
			out.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public static List<String> readList(String file) {
		try {
			List<String> list = new ArrayList<String>();
			BufferedReader br = new BufferedReader(new FileReader(file));
			String line = null;
			while ((line=br.readLine()) != null) {
				list.add(line);
			}
			return list;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	public static Map<Long,Integer> readMap(String file) {
		try {
			Map<Long,Integer> map = new HashMap<Long,Integer>();
			BufferedReader br = new BufferedReader(new FileReader(file));
			String line = null;
			while ((line=br.readLine()) != null) {
				String[] tok = line.split("\t");
				long key = Long.parseLong(tok[0]);
				int value = Integer.parseInt(tok[1]);
				map.put(key, value);
			}
			return map;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	// -- SORT ----------------------------------------------------------------

	// -- sort doubles -----
	
	/**
     * Sort two arrays simultaneously, using the sort order of the values
     * in the first array to determine the sort order for both arrays.
     * @param a the array to sort by
     * @param b the array to re-arrange based on the sort order of the
     * first array.
     */
    public static final int[] sortindices(double[] x) {
    	double a[] = new double[x.length];
    	int b[] = new int[a.length];
    	for (int i=0; i<a.length; ++i) {
    		a[i] = x[i];
    		b[i] = i;
    	}
        mergesort(a, b, 0, a.length - 1);
        return b;
    }
	
    /**
     * Sort two arrays simultaneously, using the sort order of the values
     * in the first array to determine the sort order for both arrays.
     * @param a the array to sort by
     * @param b the array to re-arrange based on the sort order of the
     * first array.
     */
    public static final void sort(double[] a, int[] b) {
        mergesort(a, b, 0, a.length - 1);
    }

    /**
     * Sort two arrays simultaneously, using the sort order of the values
     * in the first array to determine the sort order for both arrays.
     * @param a the array to sort by
     * @param b the array to re-arrange based on the sort order of the
     * first array.
     * @param length the array range length to sort over
     */
    public static final void sort(double[] a, int[] b, int length) {
        mergesort(a, b, 0, length - 1);
    }

    /**
     * Sort two arrays simultaneously, using the sort order of the values
     * in the first array to determine the sort order for both arrays.
     * @param a the array to sort by
     * @param b the array to re-arrange based on the sort order of the
     * first array.
     * @param begin the start index of the range to sort
     * @param end the end index, exclusive, of the range to sort
     */
    public static final void sort(double[] a, int[] b, int begin, int end) {
        mergesort(a, b, begin, end - 1);
    }

    // -- Insertion Sort --

    protected static final void insertionsort(double[] a, int[] b, int p, int r) {
        for (int j = p + 1; j <= r; ++j) {
        	double key = a[j];
            int val = b[j];
            int i = j - 1;
            while (i >= p && a[i] > key) {
                a[i + 1] = a[i];
                b[i + 1] = b[i];
                i--;
            }
            a[i + 1] = key;
            b[i + 1] = val;
        }
    }

    // -- Mergesort --

    /**
     * Arrays with lengths beneath this value will be insertion sorted.
     */    
    protected static final void mergesort(double[] a, int[] b, int p, int r) {
        if (p >= r) {
            return;
        }
        if (r - p + 1 < SORT_THRESHOLD) {
            insertionsort(a, b, p, r);
        } else {
            int q = (p + r) / 2;
            mergesort(a, b, p, q);
            mergesort(a, b, q + 1, r);
            merge(a, b, p, q, r);
        }
    }

    protected static final void merge(double[] a, int[] b, int p, int q, int r) {
    	double[] t = new double[r - p + 1];
        int[] v = new int[r - p + 1];
        int i, p1 = p, p2 = q + 1;
        for (i = 0; p1 <= q && p2 <= r; ++i) {
            if (a[p1] < a[p2]) {
                v[i] = b[p1];
                t[i] = a[p1++];
            } else {
                v[i] = b[p2];
                t[i] = a[p2++];
            }
        }
        for (; p1 <= q; ++p1, ++i) {
            v[i] = b[p1];
            t[i] = a[p1];
        }
        for (; p2 <= r; ++p2, ++i) {
            v[i] = b[p2];
            t[i] = a[p2];
        }
        for (i = 0, p1 = p; i < t.length; ++i, ++p1) {
            b[p1] = v[i];
            a[p1] = t[i];
        }
    }
	
	// -- sort longs -----
	
	/**
     * Sort two arrays simultaneously, using the sort order of the values
     * in the first array to determine the sort order for both arrays.
     * @param a the array to sort by
     * @param b the array to re-arrange based on the sort order of the
     * first array.
     */
    public static final int[] sortindices(long[] x) {
    	long a[] = new long[x.length];
    	int b[] = new int[a.length];
    	for (int i=0; i<a.length; ++i) {
    		a[i] = x[i];
    		b[i] = i;
    	}
        mergesort(a, b, 0, a.length - 1);
        return b;
    }
	
    /**
     * Sort two arrays simultaneously, using the sort order of the values
     * in the first array to determine the sort order for both arrays.
     * @param a the array to sort by
     * @param b the array to re-arrange based on the sort order of the
     * first array.
     */
    public static final void sort(long[] a, int[] b) {
        mergesort(a, b, 0, a.length - 1);
    }

    /**
     * Sort two arrays simultaneously, using the sort order of the values
     * in the first array to determine the sort order for both arrays.
     * @param a the array to sort by
     * @param b the array to re-arrange based on the sort order of the
     * first array.
     * @param length the array range length to sort over
     */
    public static final void sort(long[] a, int[] b, int length) {
        mergesort(a, b, 0, length - 1);
    }

    /**
     * Sort two arrays simultaneously, using the sort order of the values
     * in the first array to determine the sort order for both arrays.
     * @param a the array to sort by
     * @param b the array to re-arrange based on the sort order of the
     * first array.
     * @param begin the start index of the range to sort
     * @param end the end index, exclusive, of the range to sort
     */
    public static final void sort(long[] a, int[] b, int begin, int end) {
        mergesort(a, b, begin, end - 1);
    }

    // -- Insertion Sort --

    protected static final void insertionsort(long[] a, int[] b, int p, int r) {
        for (int j = p + 1; j <= r; ++j) {
        	long key = a[j];
            int val = b[j];
            int i = j - 1;
            while (i >= p && a[i] > key) {
                a[i + 1] = a[i];
                b[i + 1] = b[i];
                i--;
            }
            a[i + 1] = key;
            b[i + 1] = val;
        }
    }

    // -- Mergesort --

    /**
     * Arrays with lengths beneath this value will be insertion sorted.
     */    
    protected static final void mergesort(long[] a, int[] b, int p, int r) {
        if (p >= r) {
            return;
        }
        if (r - p + 1 < SORT_THRESHOLD) {
            insertionsort(a, b, p, r);
        } else {
            int q = (p + r) / 2;
            mergesort(a, b, p, q);
            mergesort(a, b, q + 1, r);
            merge(a, b, p, q, r);
        }
    }

    protected static final void merge(long[] a, int[] b, int p, int q, int r) {
    	long[] t = new long[r - p + 1];
        int[] v = new int[r - p + 1];
        int i, p1 = p, p2 = q + 1;
        for (i = 0; p1 <= q && p2 <= r; ++i) {
            if (a[p1] < a[p2]) {
                v[i] = b[p1];
                t[i] = a[p1++];
            } else {
                v[i] = b[p2];
                t[i] = a[p2++];
            }
        }
        for (; p1 <= q; ++p1, ++i) {
            v[i] = b[p1];
            t[i] = a[p1];
        }
        for (; p2 <= r; ++p2, ++i) {
            v[i] = b[p2];
            t[i] = a[p2];
        }
        for (i = 0, p1 = p; i < t.length; ++i, ++p1) {
            b[p1] = v[i];
            a[p1] = t[i];
        }
    }
    
	// -- sort integers -----
	
	/**
     * Sort two arrays simultaneously, using the sort order of the values
     * in the first array to determine the sort order for both arrays.
     * @param a the array to sort by
     * @param b the array to re-arrange based on the sort order of the
     * first array.
     */
    public static final int[] sortindices(int[] x) {
    	int a[] = new int[x.length];
    	int b[] = new int[a.length];
    	for (int i=0; i<a.length; ++i) {
    		a[i] = x[i];
    		b[i] = i;
    	}
        mergesort(a, b, 0, a.length - 1);
        return b;
    }
	
    /**
     * Sort two arrays simultaneously, using the sort order of the values
     * in the first array to determine the sort order for both arrays.
     * @param a the array to sort by
     * @param b the array to re-arrange based on the sort order of the
     * first array.
     */
    public static final void sort(int[] a, int[] b) {
        mergesort(a, b, 0, a.length - 1);
    }

    /**
     * Sort two arrays simultaneously, using the sort order of the values
     * in the first array to determine the sort order for both arrays.
     * @param a the array to sort by
     * @param b the array to re-arrange based on the sort order of the
     * first array.
     * @param length the array range length to sort over
     */
    public static final void sort(int[] a, int[] b, int length) {
        mergesort(a, b, 0, length - 1);
    }

    /**
     * Sort two arrays simultaneously, using the sort order of the values
     * in the first array to determine the sort order for both arrays.
     * @param a the array to sort by
     * @param b the array to re-arrange based on the sort order of the
     * first array.
     * @param begin the start index of the range to sort
     * @param end the end index, exclusive, of the range to sort
     */
    public static final void sort(int[] a, int[] b, int begin, int end) {
        mergesort(a, b, begin, end - 1);
    }

    // -- Insertion Sort --

    protected static final void insertionsort(int[] a, int[] b, int p, int r) {
        for (int j = p + 1; j <= r; ++j) {
            int key = a[j];
            int val = b[j];
            int i = j - 1;
            while (i >= p && a[i] > key) {
                a[i + 1] = a[i];
                b[i + 1] = b[i];
                i--;
            }
            a[i + 1] = key;
            b[i + 1] = val;
        }
    }

    // -- Mergesort --

    /**
     * Arrays with lengths beneath this value will be insertion sorted.
     */
    protected static final int SORT_THRESHOLD = 30;
    
    protected static final void mergesort(int[] a, int[] b, int p, int r) {
        if (p >= r) {
            return;
        }
        if (r - p + 1 < SORT_THRESHOLD) {
            insertionsort(a, b, p, r);
        } else {
            int q = (p + r) / 2;
            mergesort(a, b, p, q);
            mergesort(a, b, q + 1, r);
            merge(a, b, p, q, r);
        }
    }

    protected static final void merge(int[] a, int[] b, int p, int q, int r) {
        int[] t = new int[r - p + 1];
        int[] v = new int[r - p + 1];
        int i, p1 = p, p2 = q + 1;
        for (i = 0; p1 <= q && p2 <= r; ++i) {
            if (a[p1] < a[p2]) {
                v[i] = b[p1];
                t[i] = a[p1++];
            } else {
                v[i] = b[p2];
                t[i] = a[p2++];
            }
        }
        for (; p1 <= q; ++p1, ++i) {
            v[i] = b[p1];
            t[i] = a[p1];
        }
        for (; p2 <= r; ++p2, ++i) {
            v[i] = b[p2];
            t[i] = a[p2];
        }
        for (i = 0, p1 = p; i < t.length; ++i, ++p1) {
            b[p1] = v[i];
            a[p1] = t[i];
        }
    }
}
