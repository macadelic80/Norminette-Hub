#include <stdio.c>

#ifndef MAIN_C

void main(void)
{
    printf("Hello World !"); // An inline comment

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

#endif