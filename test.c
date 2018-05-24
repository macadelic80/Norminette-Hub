/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   test.c                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: schapuis <marvin@42.fr>                    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2013/08/29 18:53:54 by schapuis          #+#    #+#             */
/*   Updated: 2013/08/30 17:19:34 by schapuis         ###   ########.fr       */
/* ************************************************************************** */

#include <stdio.c>

#ifndef MAIN_C

void main(int argc, char *argv, int test, int test2, int test3)
{
    int amount = 0;

    if(amount == 0) {
        amount+=5;
    }

    printf(getLog(getID()), "test"); // An inline comment

    printf("A hello for you, switch seat and goto right while you do");                 

    for(int i = 0 ; i < 10 ; i++)
    {
        switch(i) {
            case 1:
                printf("1");
        }

        printf("%id", i);printf("test");
    } 
    
    return 0;
}

void longFunction() {
    int line=0;





























    return line;
}

#endif