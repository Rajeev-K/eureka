/*
 * Copyright (C) 2009, 2013 Matthieu Casanova
 * Copyright (C) 2009, 2011 Shlomy Reinstein
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 */

package eureka;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.util.CharTokenizer;

public class SourceCodeAnalyzer extends Analyzer
{
    @Override
    protected TokenStreamComponents createComponents(String fieldName)
    {
        return new TokenStreamComponents(new SourceCodeTokenizer());
    }

    private static class SourceCodeTokenizer extends CharTokenizer
    {
        SourceCodeTokenizer()
        {
            super();
        }

        @Override
        protected boolean isTokenChar(int c)
        {
            return ((c >= 'A') && (c <= 'Z')) || ((c >= 'a') && (c <= 'z')) || ((c >= '0') && (c <= '9'))
                   || (c == '_');
        }
    }
}
